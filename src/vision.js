import { CONFIG } from "./config.js";

function normalizeVector(dx, dy) {
  const length = Math.hypot(dx, dy);
  if (length < 0.0001) {
    return { x: 0, y: -1 };
  }
  return { x: dx / length, y: dy / length };
}

export class HandTracker {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
    this.handLandmarker = null;
    this.imageSegmenter = null;
    this.FilesetResolver = null;
    this.HandLandmarker = null;
    this.ImageSegmenter = null;
    this.ready = false;
    this.lastDetectAtMs = 0;
    this.lastSegmentationAtMs = 0;
    this.lastHands = [];
    this.smoothedHands = new Map();
    this.segmentation = null;
    this.segmentationLabels = [];
    this.personCategoryIndex = 1;
    this.stats = {
      handsDetected: 0,
      lastResultAtMs: 0,
      videoWidth: 0,
      videoHeight: 0,
      errors: 0,
      segmentationReady: false,
    };
  }

  async start(onStatus = () => {}) {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("getUserMedia is not available in this browser");
    }

    onStatus("loading hand tracker…");
    const visionModule = await import(CONFIG.mediaPipeVisionUrl);
    this.FilesetResolver = visionModule.FilesetResolver;
    this.HandLandmarker = visionModule.HandLandmarker;
    this.ImageSegmenter = visionModule.ImageSegmenter;

    onStatus("starting camera…");
    this.stream = await navigator.mediaDevices.getUserMedia(CONFIG.webcamConstraints);
    this.video.srcObject = this.stream;

    await this.video.play();

    onStatus("warming up hand model…");
    const vision = await this.FilesetResolver.forVisionTasks(CONFIG.mediaPipeWasmRoot);
    this.handLandmarker = await this.HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: CONFIG.mediaPipeHandModel,
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: CONFIG.minHandConfidence,
      minHandPresenceConfidence: CONFIG.minHandConfidence,
      minTrackingConfidence: CONFIG.minHandConfidence,
    });

    try {
      this.imageSegmenter = await this.ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: CONFIG.mediaPipeSegmentationModel,
        },
        runningMode: "VIDEO",
        outputCategoryMask: true,
        outputConfidenceMasks: true,
      });
      this.segmentationLabels = this.imageSegmenter.getLabels?.() ?? [];
      this.personCategoryIndex = this.resolvePersonCategoryIndex(
        this.segmentationLabels
      );
      this.stats.segmentationReady = true;
    } catch (error) {
      this.stats.errors += 1;
      this.imageSegmenter = null;
      this.stats.segmentationReady = false;
      console.warn("Segmentation unavailable, continuing without it", error);
    }

    this.ready = true;
  }

  resolvePersonCategoryIndex(labels) {
    if (CONFIG.mediaPipeSegmentationModel.includes("selfie_segmenter")) {
      return 1;
    }

    if (!labels.length) {
      return 1;
    }

    const normalized = labels.map((label) => label.toLowerCase());
    const personIndex = normalized.findIndex((label) =>
      /(person|selfie|human|foreground)/.test(label)
    );
    if (personIndex >= 0) {
      return personIndex;
    }

    const backgroundIndex = normalized.findIndex((label) =>
      /background/.test(label)
    );
    if (backgroundIndex >= 0 && labels.length === 2) {
      return backgroundIndex === 0 ? 1 : 0;
    }

    return 1;
  }

  choosePersonConfidenceMask(confidenceMasks) {
    if (!confidenceMasks?.length) {
      return null;
    }

    if (confidenceMasks.length === 1) {
      return confidenceMasks[0];
    }

    if (confidenceMasks.length === 2) {
      const means = confidenceMasks.map((mask) => {
        const values = mask.getAsFloat32Array();
        let sum = 0;
        for (let i = 0; i < values.length; i += 1) {
          sum += values[i];
        }
        return {
          mask,
          values,
          mean: sum / Math.max(1, values.length),
        };
      });

      means.sort((a, b) => a.mean - b.mean);
      return means[0];
    }

    const resolved =
      confidenceMasks[this.personCategoryIndex] ?? confidenceMasks[0];
    return {
      mask: resolved,
      values: resolved.getAsFloat32Array(),
    };
  }

  normalizeAlphaMask(alphaMask) {
    let filled = 0;
    for (let i = 0; i < alphaMask.length; i += 1) {
      if (alphaMask[i] > 0) {
        filled += 1;
      }
    }

    const coverage = filled / Math.max(1, alphaMask.length);
    if (coverage > 0.65) {
      for (let i = 0; i < alphaMask.length; i += 1) {
        alphaMask[i] = alphaMask[i] > 0 ? 0 : 255;
      }
    }

    return alphaMask;
  }

  async setMinConfidence(value) {
    if (!this.handLandmarker) {
      return;
    }

    await this.handLandmarker.setOptions({
      minHandDetectionConfidence: value,
      minHandPresenceConfidence: value,
      minTrackingConfidence: value,
    });
  }

  detect(nowMs, cameraFrame) {
    if (
      !this.ready ||
      !this.handLandmarker ||
      this.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      this.video.videoWidth === 0 ||
      this.video.videoHeight === 0
    ) {
      return this.lastHands;
    }

    // Live MediaStream elements do not always advance currentTime reliably.
    // Throttle by wall-clock time instead of video timeline so detection
    // continues on webcam streams across browsers.
    if (nowMs - this.lastDetectAtMs < 1000 / 45) {
      return this.lastHands;
    }

    this.lastDetectAtMs = nowMs;
    this.stats.videoWidth = this.video.videoWidth;
    this.stats.videoHeight = this.video.videoHeight;

    try {
      const result = this.handLandmarker.detectForVideo(this.video, nowMs);
      const landmarks = result.landmarks ?? [];
      const handedness = result.handedness ?? [];

      const detectedHands = landmarks.map((points, index) => {
        const tip = points[8];
        const base = points[7];
        const label = handedness[index]?.[0]?.categoryName ?? `Hand ${index + 1}`;
        const color = CONFIG.handColors[label] ?? CONFIG.handColors.default;
        const id = label;
        const previous = this.smoothedHands.get(id);
        const frameX = cameraFrame?.x ?? 0;
        const frameY = cameraFrame?.y ?? 0;
        const frameWidth = cameraFrame?.width ?? this.video.videoWidth;
        const frameHeight = cameraFrame?.height ?? this.video.videoHeight;
        const rawX = frameX + (1 - tip.x) * frameWidth;
        const rawY = frameY + tip.y * frameHeight;
        const rawBaseX = frameX + (1 - base.x) * frameWidth;
        const rawBaseY = frameY + base.y * frameHeight;
        const x = previous
          ? previous.x + (rawX - previous.x) * CONFIG.handSmoothing
          : rawX;
        const y = previous
          ? previous.y + (rawY - previous.y) * CONFIG.handSmoothing
          : rawY;
        const baseX = previous
          ? previous.baseX + (rawBaseX - previous.baseX) * CONFIG.handSmoothing
          : rawBaseX;
        const baseY = previous
          ? previous.baseY + (rawBaseY - previous.baseY) * CONFIG.handSmoothing
          : rawBaseY;
        const rawDirection = normalizeVector(rawX - rawBaseX, rawY - rawBaseY);
        const direction = normalizeVector(x - baseX, y - baseY);
        const rawNormal = { x: -rawDirection.y, y: rawDirection.x };
        const normal = { x: -direction.y, y: direction.x };
        const rawBladeCenterX = rawX - rawDirection.x * CONFIG.sliceBladeBackOffset;
        const rawBladeCenterY = rawY - rawDirection.y * CONFIG.sliceBladeBackOffset;
        const bladeCenterX = x - direction.x * CONFIG.sliceBladeBackOffset;
        const bladeCenterY = y - direction.y * CONFIG.sliceBladeBackOffset;
        const hand = {
          id,
          label,
          color,
          x,
          y,
          baseX,
          baseY,
          rawX,
          rawY,
          rawBaseX,
          rawBaseY,
          bladeStartX: bladeCenterX - normal.x * CONFIG.sliceBladeHalfWidth,
          bladeStartY: bladeCenterY - normal.y * CONFIG.sliceBladeHalfWidth,
          bladeEndX: bladeCenterX + normal.x * CONFIG.sliceBladeHalfWidth,
          bladeEndY: bladeCenterY + normal.y * CONFIG.sliceBladeHalfWidth,
          rawBladeStartX:
            rawBladeCenterX - rawNormal.x * CONFIG.sliceBladeHalfWidth,
          rawBladeStartY:
            rawBladeCenterY - rawNormal.y * CONFIG.sliceBladeHalfWidth,
          rawBladeEndX:
            rawBladeCenterX + rawNormal.x * CONFIG.sliceBladeHalfWidth,
          rawBladeEndY:
            rawBladeCenterY + rawNormal.y * CONFIG.sliceBladeHalfWidth,
          z: tip.z,
        };
        this.smoothedHands.set(id, hand);
        return hand;
      });

      for (const id of [...this.smoothedHands.keys()]) {
        if (!detectedHands.some((hand) => hand.id === id)) {
          this.smoothedHands.delete(id);
        }
      }

      this.lastHands = detectedHands.map((hand) => {
        return {
          ...hand,
        };
      });

      this.stats.handsDetected = this.lastHands.length;
      this.stats.lastResultAtMs = nowMs;
    } catch (error) {
      this.stats.errors += 1;
      console.error("Hand detection failed", error);
    }

    return this.lastHands;
  }

  segment(nowMs) {
    if (
      !this.imageSegmenter ||
      !CONFIG.segmentationEnabled ||
      this.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      this.video.videoWidth === 0 ||
      this.video.videoHeight === 0 ||
      nowMs - this.lastSegmentationAtMs < CONFIG.segmentationIntervalMs
    ) {
      return this.segmentation;
    }

    this.lastSegmentationAtMs = nowMs;

    try {
      const result = this.imageSegmenter.segmentForVideo(this.video, nowMs);
      const selectedMask = this.choosePersonConfidenceMask(
        result?.confidenceMasks ?? []
      );
      if (selectedMask?.mask && selectedMask?.values) {
        const confidence = selectedMask.values;
        const alphaMask = new Uint8Array(confidence.length);
        for (let i = 0; i < confidence.length; i += 1) {
          alphaMask[i] = confidence[i] >= CONFIG.maskAlphaThreshold ? 255 : 0;
        }
        this.segmentation = {
          data: this.normalizeAlphaMask(alphaMask),
          width:
            selectedMask.mask.width ??
            selectedMask.mask.displayWidth ??
            this.video.videoWidth,
          height:
            selectedMask.mask.height ??
            selectedMask.mask.displayHeight ??
            this.video.videoHeight,
        };
      } else if (result?.categoryMask) {
        const categories = result.categoryMask.getAsUint8Array();
        const alphaMask = new Uint8Array(categories.length);
        for (let i = 0; i < categories.length; i += 1) {
          alphaMask[i] = categories[i] === this.personCategoryIndex ? 255 : 0;
        }
        this.segmentation = {
          data: this.normalizeAlphaMask(alphaMask),
          width:
            result.categoryMask.width ??
            result.categoryMask.displayWidth ??
            this.video.videoWidth,
          height:
            result.categoryMask.height ??
            result.categoryMask.displayHeight ??
            this.video.videoHeight,
        };
      }
      result?.close?.();
    } catch (error) {
      this.stats.errors += 1;
      console.error("Segmentation failed", error);
    }

    return this.segmentation;
  }
}
