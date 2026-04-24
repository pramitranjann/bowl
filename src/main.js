import { CONFIG } from "./config.js";
import { AudioEngine } from "./audio.js";
import { BowlSystem } from "./bowl.js";
import { Compositor } from "./compositor.js";
import { createDevPanel } from "./dev-panel.js";
import { EnvironmentSystem } from "./environment.js";
import { createDurianBurst, createJuiceBurst } from "./particles.js";
import { splitFruit } from "./entities.js";
import { applyHaze } from "./haze.js";
import { PerformanceMonitor } from "./perf.js";
import { updateBody, isBodyOffscreen } from "./physics.js";
import { detectSlices } from "./slice.js";
import { WaveSpawner } from "./spawner.js";
import { MODE_META, MODES, STATES } from "./states.js";
import { TrailSystem } from "./trail.js";
import { preloadVectorArt } from "./vector-art.js";
import { HandTracker } from "./vision.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const webcam = document.getElementById("webcam");
const environmentVideo = document.getElementById("environment");
const ui = {
  root: document.getElementById("ui-root"),
  brandButton: document.getElementById("ui-brand-button"),
  homeButton: document.getElementById("ui-home"),
  settingsButton: document.getElementById("ui-settings"),
  soundButton: document.getElementById("ui-sound"),
  menuToggleButton: document.getElementById("ui-menu-toggle"),
  modeWorldsButton: document.getElementById("mode-worlds"),
  openingScreen: document.getElementById("screen-opening"),
  calibrationScreen: document.getElementById("screen-calibration"),
  modeSelectScreen: document.getElementById("screen-mode-select"),
  countdownScreen: document.getElementById("screen-countdown"),
  idleScreen: document.getElementById("screen-idle"),
  errorScreen: document.getElementById("screen-error"),
  statusLine: document.getElementById("ui-status-line"),
  statusDetail: document.getElementById("ui-status-detail"),
  errorMessage: document.getElementById("ui-error-message"),
  playHud: document.getElementById("play-hud"),
  scoreValue: document.getElementById("ui-score-value"),
  timerPill: document.getElementById("ui-timer-pill"),
  timerValue: document.getElementById("ui-timer-value"),
  modeValue: document.getElementById("ui-mode-value"),
  durianValue: document.getElementById("ui-durian-value"),
  countdownValue: document.getElementById("ui-countdown-value"),
  gameoverActions: document.getElementById("gameover-actions"),
  idleRestartButton: document.getElementById("ui-idle-restart"),
  errorRetryButton: document.getElementById("ui-error-retry"),
  gameoverRestartButton: document.getElementById("ui-gameover-restart"),
  gameoverShareButton: document.getElementById("ui-gameover-share"),
  shareModal: document.getElementById("share-modal"),
  sharePreview: document.getElementById("ui-share-preview"),
  shareCloseX: document.getElementById("ui-share-close-x"),
  shareCloseButton: document.getElementById("ui-share-close"),
  shareDownloadButton: document.getElementById("ui-share-download"),
  modeButtons: [...document.querySelectorAll("#mode-panel-modes [data-mode]")],
  worldButtons: [...document.querySelectorAll("[data-world]")],
  worldsPanel: document.getElementById("mode-panel-worlds"),
  modesPanel: document.getElementById("mode-panel-modes"),
};

const audio = new AudioEngine();
const tracker = new HandTracker(webcam);
const trails = new TrailSystem();
const spawner = new WaveSpawner();
const bowl = new BowlSystem();
const perf = new PerformanceMonitor();
const environment = new EnvironmentSystem(environmentVideo);
const compositor = new Compositor(webcam);
const MODE_DESCRIPTIONS = {
  [MODES.ENDLESS]: "slow and generous",
  [MODES.TIMED]: "a bright little rush",
  [MODES.SUNSET]: "the long golden hour",
};
const OVERLAY_COLORS = {
  cream: "rgba(244, 235, 217, 0.82)",
  surface: "rgba(244, 235, 217, 0.94)",
  surfaceSoft: "rgba(244, 235, 217, 0.72)",
  ink: "#2a1f18",
  muted: "rgba(42, 31, 24, 0.62)",
  pandan: "#c5d86d",
  hibiscus: "#d94423",
  border: "rgba(42, 31, 24, 0.08)",
  shadow: "rgba(42, 31, 24, 0.16)",
};

const game = {
  state: STATES.LOADING,
  currentMode: MODES.ENDLESS,
  stateSince: performance.now(),
  statusText: "loading phase 2…",
  score: 0,
  livesLost: 0,
  entities: [],
  halves: [],
  particles: [],
  flashStrength: 0,
  gameOverAt: 0,
  restartButton: null,
  restartHoverStartedAt: 0,
  playStartedAt: 0,
  modeEndsAt: Infinity,
  calibrationStartedAt: 0,
  calibrationMissingSince: 0,
  calibrationProgressMs: 0,
  modeHover: new Map(),
  uiButtonHover: new Map(),
  lastMovementAt: performance.now(),
  lastHandSnapshot: new Map(),
  slowMotionUntil: 0,
  segmentation: null,
  liteMode: false,
  forceLiteMode: false,
  soundMuted: false,
  sharePreviewUrl: "",
  menuPanel: "modes",
  currentWorld: "sunset",
  countdownEndsAt: 0,
};

const metrics = {
  fps: 0,
  averageFps: 0,
};

const viewport = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(window.devicePixelRatio || 1, 2),
};

const LOADING_STEPS = [
  "sharpening your blade....",
  "cooling the coconuts....",
  "setting out the bowl....",
  "warming the tide....",
];

const STARTUP_LOADING_MS = 4200;
const LOADING_STEP_MS = 1050;
const COUNTDOWN_DURATION_MS = 4000;

let lastFrameMs = performance.now();
let startupComplete = false;

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getLoadingCopy(nowMs = performance.now()) {
  const index = Math.min(
    LOADING_STEPS.length - 1,
    Math.floor(Math.max(0, nowMs - game.stateSince) / LOADING_STEP_MS)
  );
  return LOADING_STEPS[index];
}

function getCountdownValue(nowMs = performance.now()) {
  const remainingMs = Math.max(0, game.countdownEndsAt - nowMs);
  return Math.max(0, Math.ceil(remainingMs / 1000) - 1);
}

function normalizeSafariLoopbackOrigin() {
  const isSafari =
    /Safari/.test(navigator.userAgent) &&
    !/Chrome|Chromium|Edg\//.test(navigator.userAgent);
  if (!isSafari) {
    return false;
  }
  if (location.protocol !== "http:" || location.hostname !== "127.0.0.1") {
    return false;
  }

  const nextUrl = new URL(location.href);
  nextUrl.hostname = "localhost";
  location.replace(nextUrl.toString());
  return true;
}

const devPanel = createDevPanel({
  config: CONFIG,
  game,
  tracker,
  getMetrics: () => ({
    fps: metrics.fps,
    entities: game.entities.length + game.halves.length,
    particles: game.particles.length,
  }),
  onRestart: () => beginCalibration(performance.now()),
  onToggleLite: () => {
    game.forceLiteMode = !game.forceLiteMode;
  },
});

function resize() {
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
  viewport.dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(viewport.width * viewport.dpr);
  canvas.height = Math.round(viewport.height * viewport.dpr);
  ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  compositor.resize(viewport);
  environment.resize(viewport);
}

function getCameraFrameRect() {
  const sourceWidth = webcam.videoWidth || viewport.width;
  const sourceHeight = webcam.videoHeight || viewport.height;
  const scale = Math.max(
    viewport.width / sourceWidth,
    viewport.height / sourceHeight
  );
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (viewport.width - width) / 2;
  const y = (viewport.height - height) / 2;
  return { x, y, width, height };
}

function hasLiveWebcamFrame() {
  return (
    webcam.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    webcam.videoWidth > 0 &&
    webcam.videoHeight > 0
  );
}

function setState(state, nowMs, statusText = game.statusText) {
  game.state = state;
  game.stateSince = nowMs;
  game.statusText = statusText;
  if (state !== STATES.GAMEOVER) {
    closeShareModal();
  }
  updateUiState(nowMs);
}

function updateMenuPanel() {
  const showingWorlds = game.menuPanel === "worlds";
  ui.root.dataset.menuPanel = game.menuPanel;
  ui.modesPanel.hidden = showingWorlds;
  ui.worldsPanel.hidden = !showingWorlds;
  // Pill only shows in worlds panel as a static "Modes" breadcrumb label
  ui.menuToggleButton.hidden =
    game.state !== STATES.MODE_SELECT || !showingWorlds;
  ui.menuToggleButton.textContent = "Modes";
  ui.menuToggleButton.classList.add("ui-pill-button--static");
  ui.menuToggleButton.classList.remove("hand-target");
  ui.menuToggleButton.setAttribute("aria-hidden", "true");
  ui.menuToggleButton.setAttribute("tabindex", "-1");
}

function updateWorldSelectionUi() {
  for (const button of ui.worldButtons) {
    button.classList.toggle("is-active", button.dataset.world === game.currentWorld);
  }
}

function openShareModal() {
  try {
    game.sharePreviewUrl = canvas.toDataURL("image/png");
    ui.sharePreview.style.backgroundImage = `url("${game.sharePreviewUrl}")`;
  } catch (error) {
    console.warn("Unable to snapshot share preview", error);
    game.sharePreviewUrl = "";
    ui.sharePreview.style.backgroundImage = "";
  }
  ui.shareModal.hidden = false;
  resetAllTrackedUiButtons();
}

function closeShareModal() {
  ui.shareModal.hidden = true;
  resetAllTrackedUiButtons();
}

function downloadSharePreview() {
  if (!game.sharePreviewUrl) {
    openShareModal();
  }
  if (!game.sharePreviewUrl) {
    return;
  }
  const anchor = document.createElement("a");
  anchor.href = game.sharePreviewUrl;
  anchor.download = `bowl-${Date.now()}.png`;
  anchor.click();
}

function setSoundMuted(muted) {
  game.soundMuted = muted;
  audio.setMuted(muted);
  ui.soundButton.classList.toggle("is-muted", muted);
  ui.soundButton.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
}

function updateUiState(nowMs = performance.now()) {
  const sceneMap = {
    [STATES.OPENING]: "opening",
    [STATES.CALIBRATION]: "calibration",
    [STATES.MODE_SELECT]: "mode-select",
    [STATES.COUNTDOWN]: "countdown",
    [STATES.PLAY]: "play",
    [STATES.IDLE]: "idle",
    [STATES.GAMEOVER]: "gameover",
    [STATES.ERROR]: "error",
    [STATES.LOADING]: "loading",
  };

  ui.root.dataset.scene = sceneMap[game.state] ?? "play";
  ui.root.dataset.cameraVisible = shouldShowLiveWebcamLayer() ? "true" : "false";
  ui.openingScreen.hidden = game.state !== STATES.OPENING;
  ui.calibrationScreen.hidden =
    game.state !== STATES.CALIBRATION && game.state !== STATES.LOADING;
  ui.modeSelectScreen.hidden = game.state !== STATES.MODE_SELECT;
  ui.countdownScreen.hidden = game.state !== STATES.COUNTDOWN;
  ui.idleScreen.hidden = game.state !== STATES.IDLE;
  ui.errorScreen.hidden = game.state !== STATES.ERROR;
  ui.playHud.hidden = game.state !== STATES.PLAY;
  ui.gameoverActions.hidden = game.state !== STATES.GAMEOVER;
  ui.brandButton.hidden =
    game.state === STATES.CALIBRATION || game.state === STATES.LOADING;
  ui.homeButton.hidden = !(
    game.state === STATES.PLAY ||
    game.state === STATES.IDLE ||
    game.state === STATES.GAMEOVER
  );
  ui.settingsButton.hidden = game.state !== STATES.MODE_SELECT;
  ui.soundButton.hidden = !(
    game.state === STATES.MODE_SELECT ||
    game.state === STATES.COUNTDOWN ||
    game.state === STATES.PLAY ||
    game.state === STATES.IDLE ||
    game.state === STATES.GAMEOVER
  );

  if (game.state === STATES.LOADING) {
    ui.statusLine.textContent = getLoadingCopy(nowMs);
    ui.statusDetail.textContent = "";
  } else if (game.state === STATES.CALIBRATION) {
    ui.statusLine.textContent = "sharpening your blade....";
    ui.statusDetail.textContent = "";
  } else {
    ui.statusLine.textContent = "sharpening your blade....";
    ui.statusDetail.textContent = game.statusText;
  }
  ui.errorMessage.textContent = game.statusText;
  ui.scoreValue.textContent = `${game.score}`;
  ui.modeValue.textContent = MODE_META[game.currentMode]?.label ?? "Mode";
  ui.durianValue.textContent = `${Math.max(0, CONFIG.maxDurianHits - game.livesLost)}`;
  ui.countdownValue.textContent = `${getCountdownValue(nowMs)}`;
  ui.timerPill.hidden =
    game.currentMode !== MODES.TIMED || game.state !== STATES.PLAY;
  ui.timerValue.textContent = formatRemaining(getModeRemaining(nowMs));
  ui.playHud.dataset.timerVisible = ui.timerPill.hidden ? "false" : "true";
  updateMenuPanel();
  updateWorldSelectionUi();
}

function setTrackedUiButtonHover(button, progress) {
  button.style.setProperty("--finger-progress", `${progress}`);
  button.classList.toggle("is-finger-hovered", progress > 0);
}

function resetAllTrackedUiButtons() {
  for (const button of document.querySelectorAll(".hand-target")) {
    setTrackedUiButtonHover(button, 0);
  }
  game.uiButtonHover.clear();
}

function getTrackedUiButtons() {
  const buttons = ui.shareModal.hidden
    ? [...document.querySelectorAll(".hand-target")]
    : [...ui.shareModal.querySelectorAll(".hand-target")];

  return buttons.flatMap((button) => {
    if (
      button.hidden ||
      button.disabled ||
      button.getAttribute("aria-disabled") === "true"
    ) {
      setTrackedUiButtonHover(button, 0);
      return [];
    }

    const rect = button.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      setTrackedUiButtonHover(button, 0);
      return [];
    }

    const hitSlop = button.classList.contains("ui-icon-button")
      ? 18
      : button.id === "ui-brand-button"
        ? 12
        : button.closest("#gameover-actions")
          ? 24
          : button.closest("#screen-mode-select")
            ? 14
            : button.closest(".ui-share-actions")
              ? 14
              : 8;

    return [
      {
        id: button.id,
        button,
        x: rect.left - hitSlop,
        y: rect.top - hitSlop,
        width: rect.width + hitSlop * 2,
        height: rect.height + hitSlop * 2,
      },
    ];
  });
}

function updateTrackedUiButtons(hands, nowMs) {
  const buttons = getTrackedUiButtons();
  const visibleIds = new Set(buttons.map((button) => button.id));

  for (const [id] of game.uiButtonHover) {
    if (!visibleIds.has(id)) {
      game.uiButtonHover.delete(id);
    }
  }

  for (const button of buttons) {
    const hovering = hands.some(
      (hand) =>
        hand.x >= button.x &&
        hand.x <= button.x + button.width &&
        hand.y >= button.y &&
        hand.y <= button.y + button.height
    );

    if (!hovering) {
      game.uiButtonHover.delete(button.id);
      setTrackedUiButtonHover(button.button, 0);
      continue;
    }

    const hoverState = game.uiButtonHover.get(button.id) ?? {
      startedAt: nowMs,
      activated: false,
    };
    game.uiButtonHover.set(button.id, hoverState);

    const progress = Math.min(1, (nowMs - hoverState.startedAt) / CONFIG.modeHoverMs);
    setTrackedUiButtonHover(button.button, progress);

    if (hoverState.activated || progress < 1) {
      continue;
    }

    hoverState.activated = true;
    button.button.click();
  }
}

function goToPlaySelect(nowMs) {
  game.menuPanel = "modes";
  if (
    game.state === STATES.PLAY ||
    game.state === STATES.IDLE ||
    game.state === STATES.GAMEOVER ||
    game.state === STATES.COUNTDOWN
  ) {
    resetRound(nowMs, game.currentMode);
    setState(STATES.MODE_SELECT, nowMs, "");
    return;
  }

  if (game.state === STATES.MODE_SELECT) {
    updateUiState(nowMs);
    return;
  }

  if (game.state !== STATES.LOADING) {
    setState(STATES.MODE_SELECT, nowMs, "");
  }
}

function recalibrate(nowMs) {
  game.menuPanel = "modes";
  closeShareModal();

  if (
    game.state === STATES.PLAY ||
    game.state === STATES.IDLE ||
    game.state === STATES.GAMEOVER ||
    game.state === STATES.COUNTDOWN
  ) {
    resetRound(nowMs, game.currentMode);
  }

  beginCalibration(nowMs);
}

async function restartFlow(nowMs) {
  closeShareModal();
  if (
    game.state === STATES.PLAY ||
    game.state === STATES.IDLE ||
    game.state === STATES.GAMEOVER ||
    game.state === STATES.COUNTDOWN
  ) {
    await startMode(game.currentMode, nowMs);
    return;
  }

  if (game.state === STATES.CALIBRATION || game.state === STATES.MODE_SELECT || game.state === STATES.ERROR) {
    resetRound(nowMs, game.currentMode);
    beginCalibration(nowMs);
  }
}

function toErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function handleFatalError(error, phase = "runtime") {
  console.error(error);
  const nowMs = performance.now();
  const statusText =
    phase === "startup"
      ? toErrorMessage(error, "camera or model setup failed")
      : phase === "sunset"
        ? toErrorMessage(error, "sunset setup failed")
        : toErrorMessage(error, "runtime failed");
  setState(STATES.ERROR, nowMs, statusText);
}

function resetRound(nowMs, mode = game.currentMode) {
  game.currentMode = mode;
  game.score = 0;
  game.livesLost = 0;
  game.entities = [];
  game.halves = [];
  game.particles = [];
  game.flashStrength = 0;
  game.gameOverAt = 0;
  game.restartButton = null;
  game.restartHoverStartedAt = 0;
  game.modeHover.clear();
  game.calibrationStartedAt = 0;
  game.calibrationMissingSince = 0;
  game.calibrationProgressMs = 0;
  game.lastHandSnapshot.clear();
  game.lastMovementAt = nowMs;
  game.slowMotionUntil = 0;
  game.segmentation = null;
  game.playStartedAt = 0;
  game.modeEndsAt = Infinity;
  game.countdownEndsAt = 0;
  bowl.reset();
  trails.clear();
  spawner.reset(nowMs, mode);
  environment.reset(nowMs);
  updateUiState(nowMs);
}

function armModeTimer(nowMs) {
  game.playStartedAt = nowMs;
  game.modeEndsAt =
    game.currentMode === MODES.TIMED
      ? nowMs + CONFIG.timedDurationMs
      : game.currentMode === MODES.SUNSET
        ? nowMs + CONFIG.sunsetDurationMs
        : Infinity;
}

function beginCalibration(nowMs) {
  game.menuPanel = "modes";
  setState(STATES.CALIBRATION, nowMs, "raise your hand");
  game.calibrationStartedAt = 0;
  game.calibrationMissingSince = 0;
  game.calibrationProgressMs = 0;
  game.countdownEndsAt = 0;
  game.modeHover.clear();
}

function updateCalibration(nowMs, hands) {
  if (hands.length > 0) {
    game.calibrationMissingSince = 0;
    if (!game.calibrationStartedAt) {
      game.calibrationStartedAt = nowMs;
    }
    game.calibrationProgressMs = Math.min(
      CONFIG.calibrationHoldMs,
      nowMs - game.calibrationStartedAt
    );
    if (game.calibrationProgressMs >= CONFIG.calibrationHoldMs) {
      game.modeHover.clear();
      setState(STATES.MODE_SELECT, nowMs, "");
    }
    return;
  }

  if (!game.calibrationMissingSince) {
    game.calibrationMissingSince = nowMs;
    return;
  }

  const missingForMs = nowMs - game.calibrationMissingSince;
  if (missingForMs <= CONFIG.calibrationGraceMs) {
    return;
  }

  game.calibrationStartedAt = 0;
  game.calibrationMissingSince = 0;
  game.calibrationProgressMs = 0;
}

async function startMode(mode, nowMs) {
  game.menuPanel = "modes";
  resetRound(nowMs, mode);
  if (mode === MODES.SUNSET) {
    game.statusText = "loading sunset mask…";
    const segmentationReady = await tracker.ensureSegmentation((statusText) => {
      game.statusText = statusText;
    });
    if (!segmentationReady) {
      throw new Error("sunset mask unavailable");
    }
    environmentVideo.currentTime = 0;
    environment.requestPlayback(true);
  }
  beginCountdown(performance.now());
}

async function startSelectedWorld(nowMs) {
  if (game.currentWorld === "sunset") {
    await startMode(MODES.SUNSET, nowMs);
    return;
  }

  if (game.currentWorld === "two-player") {
    await startMode(MODES.ENDLESS, nowMs);
    return;
  }

  await startMode(MODES.TIMED, nowMs);
}

function beginCountdown(nowMs) {
  game.countdownEndsAt = nowMs + COUNTDOWN_DURATION_MS;
  setState(STATES.COUNTDOWN, nowMs, "counting in");
}

function updateCountdown(nowMs) {
  if (nowMs >= game.countdownEndsAt) {
    armModeTimer(nowMs);
    setState(STATES.PLAY, nowMs, "");
  }
}

function beginGameOver(nowMs) {
  if (game.state === STATES.GAMEOVER) {
    return;
  }
  game.gameOverAt = nowMs;
  game.restartHoverStartedAt = 0;
  bowl.compose(viewport);
  setState(STATES.GAMEOVER, nowMs, "again");
}

function restartIfAllowed(nowMs) {
  if (nowMs - game.gameOverAt < CONFIG.restartSwipeDelayMs) {
    return;
  }
  beginCalibration(nowMs);
}

function updateBodies(list, dtSeconds) {
  for (const body of list) {
    updateBody(body, dtSeconds);
  }
}

function decayFlash(dtSeconds) {
  game.flashStrength = Math.max(
    0,
    game.flashStrength - dtSeconds * CONFIG.flashDecayPerSecond
  );
}

function appendParticles(particles) {
  if (!particles.length) {
    return;
  }
  if (!game.liteMode) {
    game.particles.push(...particles);
    return;
  }
  const keepCount = Math.max(
    1,
    Math.round(particles.length * CONFIG.liteParticleFactor)
  );
  game.particles.push(...particles.slice(0, keepCount));
}

function setLiteMode(nextLiteMode, reason) {
  if (game.liteMode === nextLiteMode) {
    trails.setLiteMode(nextLiteMode);
    return;
  }
  game.liteMode = nextLiteMode;
  trails.setLiteMode(nextLiteMode);
  console.info(
    nextLiteMode ? `Lite mode enabled (${reason})` : `Lite mode disabled (${reason})`
  );
}

function updateMovement(hands, nowMs) {
  let moved = false;
  for (const hand of hands) {
    const previous = game.lastHandSnapshot.get(hand.id);
    if (
      !previous ||
      Math.hypot((hand.rawX ?? hand.x) - previous.x, (hand.rawY ?? hand.y) - previous.y) >=
        CONFIG.idleMovementThreshold
    ) {
      moved = true;
      game.lastMovementAt = nowMs;
    }
    game.lastHandSnapshot.set(hand.id, {
      x: hand.rawX ?? hand.x,
      y: hand.rawY ?? hand.y,
    });
  }

  for (const id of [...game.lastHandSnapshot.keys()]) {
    if (!hands.some((hand) => hand.id === id)) {
      game.lastHandSnapshot.delete(id);
    }
  }

  return moved;
}

function getModeRemaining(nowMs) {
  if (!Number.isFinite(game.modeEndsAt)) {
    return Infinity;
  }
  return Math.max(0, game.modeEndsAt - nowMs);
}

function getSunsetProgress(nowMs) {
  if (game.currentMode !== MODES.SUNSET) {
    return 0;
  }
  return 1 - getModeRemaining(nowMs) / CONFIG.sunsetDurationMs;
}

function handleSlices(segments, nowMs) {
  const hits = detectSlices(
    segments,
    game.entities,
    CONFIG.sliceVelocityThreshold
  );
  const hitIds = new Set();

  for (const hit of hits) {
    if (hitIds.has(hit.entity.id)) {
      continue;
    }
    hitIds.add(hit.entity.id);
    hit.entity.dead = true;

    if (hit.entity.kind === "durian") {
      game.livesLost += 1;
      game.flashStrength = 1;
      appendParticles(
        createDurianBurst({
          x: hit.point.x,
          y: hit.point.y,
          color: hit.entity.data.warningColor,
        })
      );
      if (game.livesLost >= CONFIG.maxDurianHits) {
        beginGameOver(nowMs);
      }
      continue;
    }

    game.score += hit.entity.data.score;
    const impactScale = Math.min(
      1.8,
      Math.max(0.8, hit.segment.velocity / CONFIG.sliceVelocityThreshold)
    );
    game.halves.push(...splitFruit(hit.entity, hit.point, nowMs, hit.segment));
    appendParticles(
      createJuiceBurst({
        x: hit.point.x,
        y: hit.point.y,
        color: hit.entity.data.juiceColor,
        behavior: hit.entity.data.behavior,
        intensity: impactScale,
      })
    );

    if (
      hit.entity.data.behavior === "reveal" &&
      Math.abs(hit.point.x - hit.entity.x) < hit.entity.radius * 0.18
    ) {
      game.slowMotionUntil = nowMs + 200;
    }

    audio.playSlice(
      Math.min(1.3, hit.segment.velocity / (CONFIG.sliceVelocityThreshold * 1.4))
    );
  }

  game.entities = game.entities.filter((entity) => !entity.dead);
}

function updatePlay(dtSeconds, nowMs, hands) {
  const idle = nowMs - game.lastMovementAt > CONFIG.idleThresholdMs;
  if (idle) {
    spawner.setPaused(true);
    setState(STATES.IDLE, nowMs, "");
    return;
  }

  spawner.setPaused(false);
  const spawned = spawner.update(nowMs, viewport).flat();
  if (spawned.length) {
    game.entities.push(...spawned);
  }

  handleSlices(trails.getSegments(), nowMs);

  updateBodies(game.entities, dtSeconds);
  updateBodies(game.halves, dtSeconds);
  for (const particle of game.particles) {
    particle.update(dtSeconds);
  }

  const survivors = [];
  for (const entity of game.entities) {
    if (entity.dead) {
      continue;
    }
    if (
      entity.kind === "fruit" &&
      entity.y - entity.radius > viewport.height + 10
    ) {
      bowl.push(entity);
      continue;
    }
    if (!isBodyOffscreen(entity, viewport)) {
      survivors.push(entity);
    }
  }
  game.entities = survivors;
  game.halves = game.halves.filter((half) => !isBodyOffscreen(half, viewport));
  game.particles = game.particles.filter((particle) => !particle.dead);

  if (game.currentMode !== MODES.ENDLESS && nowMs >= game.modeEndsAt) {
    beginGameOver(nowMs);
  }
}

function updateIdle(dtSeconds, nowMs) {
  updateBodies(game.entities, dtSeconds);
  updateBodies(game.halves, dtSeconds);
  for (const particle of game.particles) {
    particle.update(dtSeconds);
  }
  game.entities = game.entities.filter((entity) => !isBodyOffscreen(entity, viewport));
  game.halves = game.halves.filter((half) => !isBodyOffscreen(half, viewport));
  game.particles = game.particles.filter((particle) => !particle.dead);

  if (nowMs - game.lastMovementAt <= 80) {
    setState(STATES.PLAY, nowMs, "");
    spawner.setPaused(false);
  }
}

function updateGameOver(dtSeconds) {
  for (const particle of game.particles) {
    particle.update(dtSeconds);
  }
  game.particles = game.particles.filter((particle) => !particle.dead);
}

function getModeButtons() {
  const buttonWidth = 230;
  const buttonHeight = 84;
  const gap = 26;
  const totalWidth = buttonWidth * 3 + gap * 2;
  const left = viewport.width / 2 - totalWidth / 2;
  const top = viewport.height * 0.56;
  return [MODES.ENDLESS, MODES.TIMED, MODES.SUNSET].map((mode, index) => ({
    mode,
    x: left + index * (buttonWidth + gap),
    y: top,
    width: buttonWidth,
    height: buttonHeight,
  }));
}

async function updateModeSelect() {
  return Promise.resolve();
}

function drawGameStatus(sceneCtx, text, subtext = "") {
  sceneCtx.save();
  sceneCtx.fillStyle = OVERLAY_COLORS.cream;
  sceneCtx.fillRect(0, 0, viewport.width, viewport.height);
  const washWidth = Math.min(520, viewport.width - 100);
  const washHeight = subtext ? 144 : 108;
  const washX = viewport.width / 2;
  const washY = viewport.height * 0.31;
  sceneCtx.shadowColor = OVERLAY_COLORS.shadow;
  sceneCtx.shadowBlur = 28;
  sceneCtx.shadowOffsetY = 14;
  sceneCtx.fillStyle = OVERLAY_COLORS.surfaceSoft;
  sceneCtx.beginPath();
  sceneCtx.ellipse(washX, washY, washWidth / 2, washHeight / 2, -0.02, 0, Math.PI * 2);
  sceneCtx.fill();
  sceneCtx.shadowColor = "transparent";
  sceneCtx.fillStyle = OVERLAY_COLORS.ink;
  sceneCtx.textAlign = "center";
  sceneCtx.textBaseline = "middle";
  sceneCtx.font = '400 88px "Reenie Beanie", cursive';
  sceneCtx.fillText(text, viewport.width / 2, viewport.height * 0.29);
  if (subtext) {
    sceneCtx.fillStyle = OVERLAY_COLORS.muted;
    sceneCtx.font = '400 32px "Reenie Beanie", cursive';
    sceneCtx.fillText(subtext, viewport.width / 2, viewport.height * 0.36);
  }
  sceneCtx.strokeStyle = OVERLAY_COLORS.pandan;
  sceneCtx.lineWidth = 6;
  sceneCtx.lineCap = "round";
  sceneCtx.beginPath();
  sceneCtx.moveTo(viewport.width / 2 - 96, viewport.height * 0.337);
  sceneCtx.quadraticCurveTo(
    viewport.width / 2 - 8,
    viewport.height * 0.365,
    viewport.width / 2 + 94,
    viewport.height * 0.332
  );
  sceneCtx.stroke();
  sceneCtx.fillStyle = OVERLAY_COLORS.hibiscus;
  sceneCtx.beginPath();
  sceneCtx.arc(viewport.width / 2 + 126, viewport.height * 0.25, 4, 0, Math.PI * 2);
  sceneCtx.fill();
  sceneCtx.restore();
}

function renderModeSelect(sceneCtx, hands) {
  drawGameStatus(sceneCtx, "choose a mode", "rest your hand on one to begin");
  for (const button of getModeButtons()) {
    const activeStarted = game.modeHover.get(button.mode);
    const hoverProgress = activeStarted
      ? Math.min(1, (performance.now() - activeStarted) / CONFIG.modeHoverMs)
      : 0;
    sceneCtx.save();
    sceneCtx.translate(button.x + button.width / 2, button.y + button.height / 2);
    sceneCtx.rotate((button.mode === MODES.TIMED ? 0.01 : button.mode === MODES.SUNSET ? -0.014 : -0.02));
    sceneCtx.shadowColor = OVERLAY_COLORS.shadow;
    sceneCtx.shadowBlur = 22;
    sceneCtx.shadowOffsetY = 12;
    sceneCtx.fillStyle = hoverProgress > 0
      ? `rgba(197, 216, 109, ${0.54 + hoverProgress * 0.22})`
      : OVERLAY_COLORS.surfaceSoft;
    sceneCtx.beginPath();
    sceneCtx.ellipse(0, 0, button.width * 0.48, button.height * 0.46, 0, 0, Math.PI * 2);
    sceneCtx.fill();
    sceneCtx.shadowColor = "transparent";
    sceneCtx.fillStyle = "rgba(255,255,255,0.24)";
    sceneCtx.globalAlpha = 0.4;
    sceneCtx.beginPath();
    sceneCtx.ellipse(-button.width * 0.06, -button.height * 0.06, button.width * 0.18, button.height * 0.12, 0, 0, Math.PI * 2);
    sceneCtx.fill();
    sceneCtx.globalAlpha = 1;
    sceneCtx.fillStyle = OVERLAY_COLORS.ink;
    sceneCtx.textAlign = "center";
    sceneCtx.textBaseline = "middle";
    sceneCtx.font = '400 58px "Reenie Beanie", cursive';
    sceneCtx.fillText(
      MODE_META[button.mode].label,
      0,
      -10
    );
    sceneCtx.font = '400 28px "Reenie Beanie", cursive';
    sceneCtx.fillStyle = OVERLAY_COLORS.muted;
    sceneCtx.fillText(
      MODE_DESCRIPTIONS[button.mode],
      0,
      26
    );
    if (hoverProgress > 0) {
      sceneCtx.strokeStyle = OVERLAY_COLORS.pandan;
      sceneCtx.lineWidth = 6;
      sceneCtx.lineCap = "round";
      sceneCtx.beginPath();
      sceneCtx.moveTo(-56, 12);
      sceneCtx.quadraticCurveTo(0, 28, 54, 10);
      sceneCtx.stroke();
    }
    sceneCtx.restore();
  }
}

function renderHandMarkers(sceneCtx, hands) {
  if (!hands.length) {
    return;
  }
  sceneCtx.save();
  for (const hand of hands) {
    sceneCtx.strokeStyle = hand.color;
    sceneCtx.lineWidth = 4;
    sceneCtx.beginPath();
    sceneCtx.moveTo(hand.rawBladeStartX ?? hand.rawX ?? hand.x, hand.rawBladeStartY ?? hand.rawY ?? hand.y);
    sceneCtx.lineTo(hand.rawBladeEndX ?? hand.rawX ?? hand.x, hand.rawBladeEndY ?? hand.rawY ?? hand.y);
    sceneCtx.stroke();

    sceneCtx.fillStyle = hand.color;
    sceneCtx.beginPath();
    sceneCtx.arc(hand.rawX ?? hand.x, hand.rawY ?? hand.y, 7, 0, Math.PI * 2);
    sceneCtx.fill();
  }
  sceneCtx.restore();
}

function renderEntities(sceneCtx, nowMs) {
  for (const entity of game.entities) {
    entity.render(sceneCtx, nowMs);
  }
  for (const half of game.halves) {
    half.render(sceneCtx);
  }
}

function renderParticles(sceneCtx) {
  for (const particle of game.particles) {
    particle.render(sceneCtx);
  }
}

function shouldUseSunsetComposite() {
  return (
    game.currentMode === MODES.SUNSET &&
    (game.state === STATES.PLAY ||
      game.state === STATES.IDLE ||
      game.state === STATES.GAMEOVER)
  );
}

function shouldShowLiveWebcamLayer() {
  if (!hasLiveWebcamFrame()) {
    return false;
  }
  if (!shouldUseSunsetComposite()) {
    return true;
  }
  return !!game.segmentation?.data;
}

function renderScene(nowMs, hands, frame, segmentation) {
  const sceneCtx = compositor.sceneCtx;
  const useSunsetComposite = shouldUseSunsetComposite();
  const showLiveWebcamLayer = shouldShowLiveWebcamLayer();
  const hasEnvironmentFrame = environment.hasVideoFrame();
  const hasHealthyEnvironmentVideo = environment.hasRenderableVideo(nowMs);
  sceneCtx.clearRect(0, 0, viewport.width, viewport.height);
  if (useSunsetComposite) {
    if (showLiveWebcamLayer) {
      environment.renderBackground(sceneCtx, viewport);
      compositor.cutOutPlayer(
        sceneCtx,
        viewport,
        frame,
        segmentation,
        game.state
      );
      if (!hasHealthyEnvironmentVideo) {
        environment.requestPlayback();
      }
    } else {
      if (!hasEnvironmentFrame) {
        environment.renderBackground(sceneCtx, viewport);
      } else if (!hasHealthyEnvironmentVideo) {
        environment.requestPlayback();
      }
      compositor.drawPlayer(sceneCtx, viewport, frame, segmentation, game.state);
    }
    environment.renderAmbient(sceneCtx);
  } else {
    if (!showLiveWebcamLayer) {
      sceneCtx.fillStyle = "#101010";
      sceneCtx.fillRect(0, 0, viewport.width, viewport.height);
      compositor.drawMirroredFrame(sceneCtx, viewport, frame);
    }
  }
  renderEntities(sceneCtx, nowMs);
  renderParticles(sceneCtx);
  trails.render(sceneCtx, nowMs);
  renderHandMarkers(sceneCtx, hands);

  if (game.flashStrength > 0) {
    sceneCtx.save();
    sceneCtx.fillStyle = `rgba(197, 197, 51, ${game.flashStrength * 0.25})`;
    sceneCtx.fillRect(0, 0, viewport.width, viewport.height);
    sceneCtx.restore();
  }

  if (game.state === STATES.GAMEOVER) {
    sceneCtx.save();
    sceneCtx.fillStyle = "rgba(42,31,24,0.1)";
    sceneCtx.fillRect(0, 0, viewport.width, viewport.height);
    sceneCtx.restore();
    bowl.render(sceneCtx, viewport, nowMs, game.gameOverAt, game.score);
  }
}

async function animate(nowMs) {
  try {
    const baseDt = Math.min(0.033, (nowMs - lastFrameMs) / 1000);
    const timeScale = nowMs < game.slowMotionUntil ? 0.55 : 1;
    const dtSeconds = baseDt * timeScale;
    lastFrameMs = nowMs;
    decayFlash(dtSeconds);

    const perfStats = perf.update(nowMs, baseDt);
    metrics.fps = Math.round(1 / Math.max(baseDt, 0.0001));
    metrics.averageFps = Math.round(perfStats.averageFps);
    const allowAutoLite =
      game.state === STATES.PLAY ||
      game.state === STATES.IDLE ||
      game.state === STATES.GAMEOVER;
    setLiteMode(
      game.forceLiteMode || (allowAutoLite && perfStats.liteMode),
      game.forceLiteMode ? "manual" : "auto"
    );

    const frame = getCameraFrameRect();
    const useSunsetComposite = shouldUseSunsetComposite();
    const hands = tracker.ready ? tracker.detect(nowMs, frame) : [];
    updateMovement(hands, nowMs);
    if (useSunsetComposite && CONFIG.segmentationEnabled) {
      game.segmentation = tracker.segment(
        nowMs,
        CONFIG.segmentationIntervalMs
      );
    } else {
      game.segmentation = null;
    }
    trails.update(hands, nowMs);
    updateTrackedUiButtons(hands, nowMs);

    if (game.state === STATES.LOADING) {
      if (startupComplete && nowMs - game.stateSince >= STARTUP_LOADING_MS) {
        setState(STATES.OPENING, nowMs, "raise your hands");
      }
    } else if (game.state === STATES.OPENING) {
      if (hands.length > 0 && nowMs - game.stateSince > CONFIG.openingPromptMs) {
        beginCalibration(nowMs);
      }
    } else if (game.state === STATES.CALIBRATION) {
      updateCalibration(nowMs, hands);
    } else if (game.state === STATES.MODE_SELECT) {
      await updateModeSelect(hands, nowMs);
    } else if (game.state === STATES.COUNTDOWN) {
      updateCountdown(nowMs);
    } else if (game.state === STATES.PLAY) {
      updatePlay(dtSeconds, nowMs, hands);
    } else if (game.state === STATES.IDLE) {
      updateIdle(dtSeconds, nowMs);
    } else if (game.state === STATES.GAMEOVER) {
      updateGameOver(dtSeconds, nowMs, hands);
    }

    audio.setAmbientTarget(
      game.state === STATES.GAMEOVER
        ? 0.14
        : game.state === STATES.IDLE
          ? 0.16
          : game.state === STATES.PLAY
            ? 0.11
            : 0.09
    );
    audio.setDurianWarning(game.entities.some((entity) => entity.kind === "durian"));

    environment.update(nowMs, baseDt, {
      idle: game.state === STATES.IDLE && useSunsetComposite,
      mode: game.currentMode,
      sunsetProgress: getSunsetProgress(nowMs),
      viewport,
      liteMode: game.liteMode || !useSunsetComposite,
    });
    environment.setVisible(useSunsetComposite && environment.hasVideoFrame());
    webcam.style.opacity = shouldShowLiveWebcamLayer() ? "1" : "0";
    updateUiState(nowMs);

    renderScene(nowMs, hands, frame, game.segmentation);
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    const hazeActiveStates = new Set([STATES.PLAY, STATES.IDLE, STATES.GAMEOVER]);
    applyHaze(
      compositor.sceneCanvas,
      ctx,
      nowMs,
      viewport,
      !game.liteMode &&
        !useSunsetComposite &&
        game.currentMode !== MODES.TIMED &&
        hazeActiveStates.has(game.state)
    );
    devPanel.update();
  } catch (error) {
    handleFatalError(error, startupComplete ? "runtime" : "startup");
  } finally {
    requestAnimationFrame(animate);
  }
}

async function init() {
  if (normalizeSafariLoopbackOrigin()) {
    return;
  }
  resize();
  preloadVectorArt();
  window.addEventListener("resize", resize);
  window.addEventListener(
    "pointerdown",
    () => {
      audio.unlock();
      environment.requestPlayback(true);
    },
    { passive: true }
  );

  ui.homeButton.addEventListener("click", () => {
    audio.unlock();
    goToPlaySelect(performance.now());
  });

  ui.brandButton.addEventListener("click", () => {
    audio.unlock();
    goToPlaySelect(performance.now());
  });

  ui.settingsButton.addEventListener("click", () => {
    audio.unlock();
    recalibrate(performance.now());
  });

  ui.soundButton.addEventListener("click", () => {
    audio.unlock();
    setSoundMuted(!game.soundMuted);
  });

  const restartHandler = async () => {
    audio.unlock();
    try {
      await restartFlow(performance.now());
    } catch (error) {
      handleFatalError(error, game.currentMode === MODES.SUNSET ? "sunset" : "runtime");
    }
  };

  ui.idleRestartButton.addEventListener("click", restartHandler);
  ui.errorRetryButton.addEventListener("click", restartHandler);
  ui.gameoverRestartButton.addEventListener("click", restartHandler);

  ui.gameoverShareButton.addEventListener("click", () => {
    openShareModal();
  });
  ui.shareCloseX.addEventListener("click", closeShareModal);
  ui.shareCloseButton.addEventListener("click", closeShareModal);
  ui.shareDownloadButton.addEventListener("click", downloadSharePreview);

  for (const button of ui.modeButtons) {
    button.addEventListener("click", async () => {
      audio.unlock();
      const mode = button.dataset.mode;
      if (!mode) {
        return;
      }
      try {
        await startMode(mode, performance.now());
      } catch (error) {
        handleFatalError(error, mode === MODES.SUNSET ? "sunset" : "runtime");
      }
    });
  }

  ui.modeWorldsButton.addEventListener("click", () => {
    audio.unlock();
    game.menuPanel = "worlds";
    updateUiState(performance.now());
  });

  for (const button of ui.worldButtons) {
    button.addEventListener("click", async () => {
      audio.unlock();
      const world = button.dataset.world;
      if (!world) {
        return;
      }
      game.currentWorld = world;
      updateWorldSelectionUi();
      try {
        await startSelectedWorld(performance.now());
      } catch (error) {
        handleFatalError(error, world === "sunset" ? "sunset" : "runtime");
      }
    });
  }

  window.addEventListener("error", (event) => {
    handleFatalError(
      event.error ?? new Error(event.message),
      startupComplete ? "runtime" : "startup"
    );
  });

  window.addEventListener("unhandledrejection", (event) => {
    handleFatalError(
      event.reason,
      startupComplete ? "runtime" : "startup"
    );
  });

  requestAnimationFrame(animate);

  try {
    await Promise.all([
      tracker.start((statusText) => {
        game.statusText = statusText;
      }),
      environment.start(),
    ]);
    startupComplete = true;
    setState(STATES.LOADING, performance.now(), "");
    updateUiState();
  } catch (error) {
    handleFatalError(error, "startup");
  }
}

init();
