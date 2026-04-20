import { CONFIG } from "./config.js";

export class HandTracker {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
    this.handLandmarker = null;
    this.FilesetResolver = null;
    this.HandLandmarker = null;
    this.ready = false;
    this.lastDetectAtMs = 0;
    this.lastHands = [];
    this.smoothedHands = new Map();
    this.stats = {
      handsDetected: 0,
      lastResultAtMs: 0,
      videoWidth: 0,
      videoHeight: 0,
      errors: 0,
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

    this.ready = true;
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
        const x = previous
          ? previous.x + (rawX - previous.x) * CONFIG.handSmoothing
          : rawX;
        const y = previous
          ? previous.y + (rawY - previous.y) * CONFIG.handSmoothing
          : rawY;
        const hand = {
          id,
          label,
          color,
          x,
          y,
          rawX,
          rawY,
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
}
