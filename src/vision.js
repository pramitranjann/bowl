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

  detect(nowMs, viewport) {
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
    const result = this.handLandmarker.detectForVideo(this.video, nowMs);
    const landmarks = result.landmarks ?? [];
    const handedness = result.handedness ?? [];

    this.lastHands = landmarks.map((points, index) => {
      const tip = points[8];
      const label = handedness[index]?.[0]?.categoryName ?? `Hand ${index + 1}`;
      const color = CONFIG.handColors[label] ?? CONFIG.handColors.default;
      return {
        id: `${label}-${index}`,
        label,
        color,
        x: (1 - tip.x) * viewport.width,
        y: tip.y * viewport.height,
        z: tip.z,
      };
    });

    return this.lastHands;
  }
}
