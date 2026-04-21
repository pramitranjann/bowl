import { CONFIG } from "./config.js";
import { AudioEngine } from "./audio.js";
import { BowlSystem } from "./bowl.js";
import { Compositor } from "./compositor.js";
import { createDevPanel } from "./dev-panel.js";
import { EnvironmentSystem } from "./environment.js";
import { createDurianBurst, createJuiceBurst } from "./particles.js";
import { splitFruit } from "./entities.js";
import { applyHaze } from "./haze.js";
import { renderHud } from "./hud.js";
import { PerformanceMonitor } from "./perf.js";
import { updateBody, isBodyOffscreen } from "./physics.js";
import { detectSlices } from "./slice.js";
import { WaveSpawner } from "./spawner.js";
import { MODE_META, MODES, STATES } from "./states.js";
import { TrailSystem } from "./trail.js";
import { HandTracker } from "./vision.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const webcam = document.getElementById("webcam");
const environmentVideo = document.getElementById("environment");

const audio = new AudioEngine();
const tracker = new HandTracker(webcam);
const trails = new TrailSystem();
const spawner = new WaveSpawner();
const bowl = new BowlSystem();
const perf = new PerformanceMonitor();
const environment = new EnvironmentSystem(environmentVideo);
const compositor = new Compositor(webcam);

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
  playStartedAt: 0,
  modeEndsAt: Infinity,
  calibrationStartedAt: 0,
  modeHover: new Map(),
  lastMovementAt: performance.now(),
  lastHandSnapshot: new Map(),
  slowMotionUntil: 0,
  segmentation: null,
  liteMode: false,
  forceLiteMode: false,
  bowlComposed: [],
  modeSelectedAt: 0,
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

let lastFrameMs = performance.now();

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
  const scale = Math.min(
    viewport.width / sourceWidth,
    viewport.height / sourceHeight
  );
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (viewport.width - width) / 2;
  const y = (viewport.height - height) / 2;
  return { x, y, width, height };
}

function setState(state, nowMs, statusText = game.statusText) {
  game.state = state;
  game.stateSince = nowMs;
  game.statusText = statusText;
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
  game.modeHover.clear();
  game.lastHandSnapshot.clear();
  game.lastMovementAt = nowMs;
  game.slowMotionUntil = 0;
  game.segmentation = null;
  game.playStartedAt = nowMs;
  game.modeEndsAt =
    mode === MODES.TIMED
      ? nowMs + CONFIG.timedDurationMs
      : mode === MODES.SUNSET
        ? nowMs + CONFIG.sunsetDurationMs
        : Infinity;
  game.bowlComposed = [];
  bowl.reset();
  trails.clear();
  spawner.reset(nowMs, mode);
  environment.reset(nowMs);
}

function beginCalibration(nowMs) {
  setState(STATES.CALIBRATION, nowMs, "raise your hand");
  game.calibrationStartedAt = 0;
  game.modeHover.clear();
}

function startMode(mode, nowMs) {
  resetRound(nowMs, mode);
  setState(STATES.PLAY, nowMs, "");
}

function beginGameOver(nowMs) {
  if (game.state === STATES.GAMEOVER) {
    return;
  }
  game.gameOverAt = nowMs;
  game.bowlComposed = bowl.compose(viewport);
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
    game.halves.push(...splitFruit(hit.entity, hit.point, nowMs));
    appendParticles(
      createJuiceBurst({
        x: hit.point.x,
        y: hit.point.y,
        color: hit.entity.data.juiceColor,
        behavior: hit.entity.data.behavior,
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

  updateBodies(game.entities, dtSeconds);
  updateBodies(game.halves, dtSeconds);
  for (const particle of game.particles) {
    particle.update(dtSeconds);
  }

  handleSlices(trails.getSegments(), nowMs);

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

function updateGameOver(dtSeconds, nowMs) {
  for (const particle of game.particles) {
    particle.update(dtSeconds);
  }
  game.particles = game.particles.filter((particle) => !particle.dead);

  const swipeDetected = trails
    .getSegments()
    .some((segment) => segment.velocity >= CONFIG.sliceVelocityThreshold * 0.8);
  if (swipeDetected) {
    restartIfAllowed(nowMs);
  }
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

function updateModeSelect(hands, nowMs) {
  for (const button of getModeButtons()) {
    const hovering = hands.some(
      (hand) =>
        hand.x >= button.x &&
        hand.x <= button.x + button.width &&
        hand.y >= button.y &&
        hand.y <= button.y + button.height
    );
    if (!hovering) {
      game.modeHover.delete(button.mode);
      continue;
    }
    const started = game.modeHover.get(button.mode) ?? nowMs;
    game.modeHover.set(button.mode, started);
    if (nowMs - started >= CONFIG.modeHoverMs) {
      startMode(button.mode, nowMs);
      return;
    }
  }
}

function drawGameStatus(sceneCtx, text, subtext = "") {
  sceneCtx.save();
  sceneCtx.fillStyle = "rgba(0,0,0,0.28)";
  sceneCtx.fillRect(0, 0, viewport.width, viewport.height);
  sceneCtx.fillStyle = "#ffffff";
  sceneCtx.textAlign = "center";
  sceneCtx.textBaseline = "middle";
  sceneCtx.font = "700 54px system-ui, sans-serif";
  sceneCtx.fillText(text, viewport.width / 2, viewport.height * 0.42);
  if (subtext) {
    sceneCtx.font = "400 22px system-ui, sans-serif";
    sceneCtx.fillText(subtext, viewport.width / 2, viewport.height * 0.49);
  }
  sceneCtx.restore();
}

function renderModeSelect(sceneCtx, hands) {
  drawGameStatus(sceneCtx, "choose a mode", "hover over one to begin");
  for (const button of getModeButtons()) {
    const activeStarted = game.modeHover.get(button.mode);
    const hoverProgress = activeStarted
      ? Math.min(1, (performance.now() - activeStarted) / CONFIG.modeHoverMs)
      : 0;
    sceneCtx.save();
    sceneCtx.fillStyle = `rgba(255,255,255,${0.1 + hoverProgress * 0.18})`;
    sceneCtx.strokeStyle = `rgba(255,255,255,${0.24 + hoverProgress * 0.4})`;
    sceneCtx.lineWidth = 2;
    sceneCtx.fillRect(button.x, button.y, button.width, button.height);
    sceneCtx.strokeRect(button.x, button.y, button.width, button.height);
    sceneCtx.fillStyle = "#ffffff";
    sceneCtx.textAlign = "center";
    sceneCtx.textBaseline = "middle";
    sceneCtx.font = "700 30px system-ui, sans-serif";
    sceneCtx.fillText(
      MODE_META[button.mode].label,
      button.x + button.width / 2,
      button.y + button.height / 2 - 10
    );
    sceneCtx.font = "400 16px system-ui, sans-serif";
    sceneCtx.fillText(
      MODE_META[button.mode].subtitle,
      button.x + button.width / 2,
      button.y + button.height / 2 + 18
    );
    sceneCtx.restore();
  }
  renderHandMarkers(sceneCtx, hands);
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
    sceneCtx.moveTo(hand.bladeStartX ?? hand.x, hand.bladeStartY ?? hand.y);
    sceneCtx.lineTo(hand.bladeEndX ?? hand.x, hand.bladeEndY ?? hand.y);
    sceneCtx.stroke();

    sceneCtx.fillStyle = hand.color;
    sceneCtx.beginPath();
    sceneCtx.arc(hand.x, hand.y, 7, 0, Math.PI * 2);
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

function renderScene(nowMs, hands, frame, segmentation) {
  const sceneCtx = compositor.sceneCtx;
  const useSunsetComposite = shouldUseSunsetComposite();
  sceneCtx.clearRect(0, 0, viewport.width, viewport.height);
  if (useSunsetComposite) {
    environment.renderBackground(sceneCtx, viewport);
    environment.renderAmbient(sceneCtx);
    compositor.drawPlayer(sceneCtx, viewport, frame, segmentation, game.state);
  } else {
    sceneCtx.fillStyle = "#101010";
    sceneCtx.fillRect(0, 0, viewport.width, viewport.height);
    compositor.drawMirroredFrame(sceneCtx, viewport, frame);
  }
  renderEntities(sceneCtx, nowMs);
  renderParticles(sceneCtx);
  trails.render(sceneCtx, nowMs);
  renderHandMarkers(sceneCtx, hands);

  if (game.state === STATES.PLAY || game.state === STATES.IDLE) {
    renderHud(sceneCtx, {
      score: game.score,
      livesLost: game.livesLost,
      width: viewport.width,
      mode: game.currentMode,
      remainingMs: getModeRemaining(nowMs),
    });
  }

  if (game.flashStrength > 0) {
    sceneCtx.save();
    sceneCtx.fillStyle = `rgba(197, 197, 51, ${game.flashStrength * 0.25})`;
    sceneCtx.fillRect(0, 0, viewport.width, viewport.height);
    sceneCtx.restore();
  }

  if (game.state === STATES.OPENING) {
    drawGameStatus(sceneCtx, "raise your hands", "enter the frame");
  } else if (game.state === STATES.CALIBRATION) {
    drawGameStatus(sceneCtx, "hold steady", "calibrating");
  } else if (game.state === STATES.MODE_SELECT) {
    renderModeSelect(sceneCtx, hands);
  } else if (game.state === STATES.IDLE) {
    drawGameStatus(sceneCtx, "resting", "move to continue");
  } else if (game.state === STATES.GAMEOVER) {
    sceneCtx.save();
    sceneCtx.fillStyle = "rgba(0,0,0,0.34)";
    sceneCtx.fillRect(0, 0, viewport.width, viewport.height);
    sceneCtx.restore();
    bowl.render(sceneCtx, viewport, nowMs, game.gameOverAt, game.score);
    game.restartButton = {
      x: viewport.width / 2 - 110,
      y: viewport.height * CONFIG.bowlCenterYRatio + CONFIG.bowlRadius + 28,
      width: 220,
      height: 60,
    };
  } else if (game.state === STATES.ERROR || game.state === STATES.LOADING) {
    drawGameStatus(sceneCtx, game.statusText);
  }
}

async function animate(nowMs) {
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
    game.segmentation = tracker.segment(nowMs);
  } else {
    game.segmentation = null;
  }
  trails.update(hands, nowMs);

  if (game.state === STATES.OPENING) {
    if (hands.length > 0 && nowMs - game.stateSince > CONFIG.openingPromptMs) {
      beginCalibration(nowMs);
    }
  } else if (game.state === STATES.CALIBRATION) {
    if (hands.length === 0) {
      game.calibrationStartedAt = 0;
    } else {
      if (!game.calibrationStartedAt) {
        game.calibrationStartedAt = nowMs;
      }
      if (nowMs - game.calibrationStartedAt >= CONFIG.calibrationHoldMs) {
        game.modeHover.clear();
        setState(STATES.MODE_SELECT, nowMs, "");
      }
    }
  } else if (game.state === STATES.MODE_SELECT) {
    updateModeSelect(hands, nowMs);
  } else if (game.state === STATES.PLAY) {
    updatePlay(dtSeconds, nowMs, hands);
  } else if (game.state === STATES.IDLE) {
    updateIdle(dtSeconds, nowMs);
  } else if (game.state === STATES.GAMEOVER) {
    updateGameOver(dtSeconds, nowMs);
  }

  audio.setAmbientTarget(
    game.state === STATES.GAMEOVER
      ? 0.09
      : game.state === STATES.IDLE
        ? 0.1
        : game.state === STATES.PLAY
          ? 0.06
          : 0.035
  );
  audio.setDurianWarning(game.entities.some((entity) => entity.kind === "durian"));

  environment.update(nowMs, baseDt, {
    idle: game.state === STATES.IDLE && useSunsetComposite,
    mode: game.currentMode,
    sunsetProgress: getSunsetProgress(nowMs),
    viewport,
    liteMode: game.liteMode || !useSunsetComposite,
  });

  renderScene(nowMs, hands, frame, game.segmentation);
  ctx.clearRect(0, 0, viewport.width, viewport.height);
  const hazeActiveStates = new Set([STATES.PLAY, STATES.IDLE, STATES.GAMEOVER]);
  applyHaze(
    compositor.sceneCanvas,
    ctx,
    nowMs,
    viewport,
    !game.liteMode &&
      game.currentMode !== MODES.TIMED &&
      hazeActiveStates.has(game.state)
  );
  devPanel.update();
  requestAnimationFrame(animate);
}

async function init() {
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointerdown", () => audio.unlock(), { passive: true });

  canvas.addEventListener("pointerdown", (event) => {
    audio.unlock();
    if (game.state !== STATES.GAMEOVER || !game.restartButton) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const button = game.restartButton;
    const inside =
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height;
    if (inside) {
      restartIfAllowed(performance.now());
    }
  });

  window.addEventListener("error", (event) => {
    console.error(event.error ?? event.message);
    setState(STATES.ERROR, performance.now(), "startup failed");
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error(event.reason);
    setState(STATES.ERROR, performance.now(), "startup failed");
  });

  requestAnimationFrame(animate);

  try {
    await Promise.all([
      tracker.start((statusText) => {
        game.statusText = statusText;
      }),
      environment.start(),
    ]);
    setState(STATES.OPENING, performance.now(), "raise your hands");
  } catch (error) {
    console.error(error);
    setState(
      STATES.ERROR,
      performance.now(),
      error instanceof Error ? error.message : "camera or model setup failed"
    );
  }
}

init();
