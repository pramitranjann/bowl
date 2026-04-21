import { CONFIG } from "./config.js";

function normalizeVector(dx, dy) {
  const length = Math.hypot(dx, dy);
  if (length < 0.0001) {
    return { x: 0, y: -1 };
  }
  return { x: dx / length, y: dy / length };
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
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
    this.vision = null;
    this.segmenterLoadingPromise = null;
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
    this.vision = await this.FilesetResolver.forVisionTasks(CONFIG.mediaPipeWasmRoot);
    this.handLandmarker = await this.HandLandmarker.createFromOptions(this.vision, {
      baseOptions: {
        modelAssetPath: CONFIG.mediaPipeHandModel,
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: CONFIG.minHandConfidence,
      minHandPresenceConfidence: CONFIG.minHandConfidence,
      minTrackingConfidence: CONFIG.minHandConfidence,
    });

    this.ready = true;
  }

  async ensureSegmentation(onStatus = () => {}) {
    if (this.imageSegmenter) {
      return true;
    }

    if (this.segmenterLoadingPromise) {
      return this.segmenterLoadingPromise;
    }

    this.segmenterLoadingPromise = (async () => {
      try {
        onStatus("loading sunset mask…");
        this.imageSegmenter = await this.ImageSegmenter.createFromOptions(this.vision, {
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
        return true;
      } catch (error) {
        this.stats.errors += 1;
        this.imageSegmenter = null;
        this.stats.segmentationReady = false;
        console.warn("Segmentation unavailable, continuing without it", error);
        return false;
      } finally {
        this.segmenterLoadingPromise = null;
      }
    })();

    return this.segmenterLoadingPromise;
  }

  resolvePersonCategoryIndex(labels) {
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

  smoothAlphaMask(nextMask) {
    const alphaMask = new Uint8Array(nextMask.length);
    const previousMask =
      this.segmentation?.data?.length === alphaMask.length
        ? this.segmentation.data
        : null;
    const smoothing = Math.min(
      Math.max(CONFIG.maskTemporalSmoothing ?? 0, 0),
      0.95
    );

    for (let i = 0; i < nextMask.length; i += 1) {
      alphaMask[i] = previousMask
        ? Math.round(previousMask[i] * smoothing + nextMask[i] * (1 - smoothing))
        : nextMask[i];
    }

    return alphaMask;
  }

  createAlphaMaskFromConfidenceMask(confidenceMask) {
    if (!confidenceMask) {
      return null;
    }

    const confidence = confidenceMask.getAsFloat32Array();
    const alphaMask = new Uint8Array(confidence.length);
    const feather = Math.max(0.01, CONFIG.maskAlphaFeather ?? 0.18);
    const low = clamp01((CONFIG.maskAlphaThreshold ?? 0.5) - feather * 0.5);
    const high = clamp01((CONFIG.maskAlphaThreshold ?? 0.5) + feather * 0.5);

    for (let i = 0; i < confidence.length; i += 1) {
      const normalized = clamp01((confidence[i] - low) / Math.max(0.001, high - low));
      alphaMask[i] = Math.round(normalized * 255);
    }

    return {
      data: this.smoothAlphaMask(alphaMask),
      width:
        confidenceMask.width ??
        confidenceMask.displayWidth ??
        this.video.videoWidth,
      height:
        confidenceMask.height ??
        confidenceMask.displayHeight ??
        this.video.videoHeight,
    };
  }

  createAlphaMaskFromCategoryMask(categoryMask) {
    if (!categoryMask) {
      return null;
    }

    const mask = categoryMask.getAsUint8Array();
    const alphaMask = new Uint8Array(mask.length);
    for (let i = 0; i < mask.length; i += 1) {
      alphaMask[i] = mask[i] === this.personCategoryIndex ? 255 : 0;
    }

    return {
      data: this.smoothAlphaMask(alphaMask),
      width:
        categoryMask.width ??
        categoryMask.displayWidth ??
        this.video.videoWidth,
      height:
        categoryMask.height ??
        categoryMask.displayHeight ??
        this.video.videoHeight,
    };
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
    if (nowMs - this.lastDetectAtMs < 1000 / (CONFIG.handDetectFps ?? 60)) {
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
        const previousDetectedAt = previous?.detectedAt ?? nowMs - 16;
        const dtMs = Math.max(1, nowMs - previousDetectedAt);
        const rawVelocity =
          previous
            ? (Math.hypot(rawX - previous.rawX, rawY - previous.rawY) / dtMs) * 1000
            : CONFIG.handFastVelocity ?? 900;
        const fastMotion = clamp01(rawVelocity / Math.max(1, CONFIG.handFastVelocity ?? 900));
        const smoothing = previous
          ? lerp(
              CONFIG.handSmoothing ?? 0.42,
              CONFIG.handFastSmoothing ?? 0.78,
              fastMotion
            )
          : 1;
        const x = previous ? previous.x + (rawX - previous.x) * smoothing : rawX;
        const y = previous ? previous.y + (rawY - previous.y) * smoothing : rawY;
        const baseX = previous
          ? previous.baseX + (rawBaseX - previous.baseX) * smoothing
          : rawBaseX;
        const baseY = previous
          ? previous.baseY + (rawBaseY - previous.baseY) * smoothing
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
          detectedAt: nowMs,
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
      const confidenceMask =
        result?.confidenceMasks?.[this.personCategoryIndex] ??
        result?.confidenceMasks?.[result?.confidenceMasks?.length - 1];
      this.segmentation =
        this.createAlphaMaskFromConfidenceMask(confidenceMask) ??
        this.createAlphaMaskFromCategoryMask(result?.categoryMask) ??
        this.segmentation;
      if (result?.confidenceMasks) {
        for (const mask of result.confidenceMasks) {
          mask?.close?.();
        }
      }
      result?.categoryMask?.close?.();
      result?.close?.();
    } catch (error) {
      this.stats.errors += 1;
      console.error("Segmentation failed", error);
    }

    return this.segmentation;
  }
}
