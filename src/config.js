export const CONFIG = {
  mediaPipeVisionUrl:
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs",
  mediaPipeWasmRoot:
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  mediaPipeHandModel:
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",

  minHandConfidence: 0.35,
  trailMaxPoints: 20,
  trailDecayMs: 400,
  sliceVelocityThreshold: 420,
  trailMinDistance: 4,
  trailWidth: 16,
  handSmoothing: 0.18,
  sliceCollisionPadding: 18,
  spawnDelayMultiplier: 1,
  waveDelayMultiplier: 1,

  fruitBaseSize: 120,
  gravity: 900,
  fruitSpawnYOffset: 100,
  fruitCullPadding: 180,
  fruitArcPeakVariance: 0.3,

  particleGravity: 860,
  particleLifeMs: 800,
  particleMinSize: 3,
  particleMaxSize: 8,
  particleBaseCount: 16,

  maxDurianHits: 3,
  hudPadding: 28,
  hudFont: "24px system-ui, sans-serif",
  scoreFont: "600 28px system-ui, sans-serif",
  overlayTitleFont: "700 58px system-ui, sans-serif",
  overlayTextFont: "400 26px system-ui, sans-serif",
  overlayButtonFont: "700 34px system-ui, sans-serif",
  gameOverFadeMs: 700,
  restartSwipeDelayMs: 900,

  flashDecayPerSecond: 3.5,

  webcamConstraints: {
    audio: false,
    video: {
      facingMode: "user",
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  },

  handColors: {
    Left: "#6bdcff",
    Right: "#ff9f6b",
    default: "#ffffff",
  },
};
