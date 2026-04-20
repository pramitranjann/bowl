import { CONFIG } from "./config.js";
import { AudioEngine } from "./audio.js";
import { createDevPanel } from "./dev-panel.js";
import { createDurianBurst, createJuiceBurst } from "./particles.js";
import { splitFruit } from "./entities.js";
import { renderHud } from "./hud.js";
import { updateBody, isBodyOffscreen } from "./physics.js";
import { detectSlices } from "./slice.js";
import { WaveSpawner } from "./spawner.js";
import { TrailSystem } from "./trail.js";
import { HandTracker } from "./vision.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const webcam = document.getElementById("webcam");

const audio = new AudioEngine();
const tracker = new HandTracker(webcam);
const trails = new TrailSystem();
const spawner = new WaveSpawner();

const game = {
  state: "loading",
  statusText: "loading hand tracker…",
  score: 0,
  livesLost: 0,
  entities: [],
  halves: [],
  particles: [],
  flashStrength: 0,
  gameOverAt: 0,
  restartButton: null,
};

const metrics = {
  fps: 0,
};

const viewport = {
  width: window.innerWidth,
  height: window.innerHeight,
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
  onRestart: () => startPlay(performance.now()),
});

function resize() {
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
  canvas.width = viewport.width;
  canvas.height = viewport.height;
}

function resetRound(nowMs) {
  game.score = 0;
  game.livesLost = 0;
  game.entities = [];
  game.halves = [];
  game.particles = [];
  game.flashStrength = 0;
  game.gameOverAt = 0;
  game.restartButton = null;
  trails.clear();
  spawner.reset(nowMs);
}

function startPlay(nowMs) {
  resetRound(nowMs);
  game.state = "playing";
  game.statusText = "";
}

function beginGameOver(nowMs) {
  game.state = "gameover";
  game.gameOverAt = nowMs;
}

function restartIfAllowed(nowMs) {
  if (
    game.state !== "gameover" ||
    nowMs - game.gameOverAt < CONFIG.restartSwipeDelayMs
  ) {
    return;
  }
  startPlay(nowMs);
}

function updateBodies(list, dtSeconds) {
  for (const body of list) {
    updateBody(body, dtSeconds);
  }
}

function handleSlices(segments, nowMs) {
  const hits = detectSlices(
    segments,
    game.entities,
    CONFIG.sliceVelocityThreshold
  );

  if (hits.length === 0) {
    return;
  }

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
      game.particles.push(
        ...createDurianBurst({
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
    game.particles.push(
      ...createJuiceBurst({
        x: hit.point.x,
        y: hit.point.y,
        color: hit.entity.data.juiceColor,
        behavior: hit.entity.data.behavior,
      })
    );
    audio.playSlice(
      Math.min(1.3, hit.segment.velocity / (CONFIG.sliceVelocityThreshold * 1.4))
    );
  }

  game.entities = game.entities.filter((entity) => !entity.dead);
}

function updatePlaying(dtSeconds, nowMs) {
  const spawned = spawner.update(nowMs, viewport);
  if (spawned.length) {
    game.entities.push(...spawned);
  }

  updateBodies(game.entities, dtSeconds);
  updateBodies(game.halves, dtSeconds);

  for (const particle of game.particles) {
    particle.update(dtSeconds);
  }

  const segments = trails.getSegments();
  handleSlices(segments, nowMs);

  game.entities = game.entities.filter(
    (entity) => !entity.dead && !isBodyOffscreen(entity, viewport)
  );
  game.halves = game.halves.filter((half) => !isBodyOffscreen(half, viewport));
  game.particles = game.particles.filter((particle) => !particle.dead);
}

function updateGameOver(dtSeconds, nowMs) {
  game.flashStrength = Math.max(0, game.flashStrength - dtSeconds * CONFIG.flashDecayPerSecond);
  const swipeDetected = trails
    .getSegments()
    .some((segment) => segment.velocity >= CONFIG.sliceVelocityThreshold * 0.9);

  if (swipeDetected) {
    restartIfAllowed(nowMs);
  }

  for (const particle of game.particles) {
    particle.update(dtSeconds);
  }
  game.particles = game.particles.filter((particle) => !particle.dead);
}

function drawVideoBackground() {
  if (webcam.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    return;
  }

  const sourceWidth = webcam.videoWidth || viewport.width;
  const sourceHeight = webcam.videoHeight || viewport.height;
  const scale = Math.min(viewport.width / sourceWidth, viewport.height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const offsetX = (viewport.width - drawWidth) / 2;
  const offsetY = (viewport.height - drawHeight) / 2;

  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  ctx.save();
  ctx.translate(viewport.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(
    webcam,
    viewport.width - offsetX - drawWidth,
    offsetY,
    drawWidth,
    drawHeight
  );
  ctx.restore();
}

function renderHandMarkers(hands) {
  if (!hands.length) {
    return;
  }

  ctx.save();
  for (const hand of hands) {
    ctx.fillStyle = hand.color;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hand.x, hand.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function renderEntities(nowMs) {
  for (const entity of game.entities) {
    entity.render(ctx, nowMs);
  }
  for (const half of game.halves) {
    half.render(ctx, nowMs);
  }
}

function renderParticles() {
  for (const particle of game.particles) {
    particle.render(ctx);
  }
}

function renderStatus() {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(0, 0, viewport.width, viewport.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = CONFIG.overlayTextFont;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(game.statusText, viewport.width / 2, viewport.height / 2 - 24);

  if (game.state === "waiting") {
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.fillText(
      `hands ${tracker.stats.handsDetected}  camera ${tracker.stats.videoWidth}×${tracker.stats.videoHeight}`,
      viewport.width / 2,
      viewport.height / 2 + 18
    );
  }
  ctx.restore();
}

function renderGameOver(nowMs) {
  const alpha = Math.min(1, (nowMs - game.gameOverAt) / CONFIG.gameOverFadeMs);
  const buttonWidth = 220;
  const buttonHeight = 72;
  const buttonX = viewport.width / 2 - buttonWidth / 2;
  const buttonY = viewport.height / 2 + 92;

  game.restartButton = {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight,
  };

  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${0.15 + alpha * 0.5})`;
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = CONFIG.overlayTitleFont;
  ctx.fillText("game over", viewport.width / 2, viewport.height / 2 - 54);

  ctx.font = CONFIG.overlayTextFont;
  ctx.fillText(`score ${game.score}`, viewport.width / 2, viewport.height / 2 + 8);

  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

  ctx.font = CONFIG.overlayButtonFont;
  ctx.fillText("again", viewport.width / 2, buttonY + buttonHeight / 2 + 2);
  ctx.restore();
}

function render(nowMs, hands) {
  ctx.clearRect(0, 0, viewport.width, viewport.height);
  drawVideoBackground();
  renderEntities(nowMs);
  renderParticles();
  trails.render(ctx, nowMs);
  renderHandMarkers(hands);

  if (game.state === "playing" || game.state === "gameover") {
    renderHud(ctx, {
      score: game.score,
      livesLost: game.livesLost,
      width: viewport.width,
    });
  }

  if (game.flashStrength > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(197, 197, 51, ${game.flashStrength * 0.25})`;
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    ctx.restore();
  }

  if (game.state === "loading" || game.state === "waiting" || game.state === "error") {
    renderStatus();
  }

  if (game.state === "gameover") {
    renderGameOver(nowMs);
  }
}

function animate(nowMs) {
  const dtSeconds = Math.min(0.033, (nowMs - lastFrameMs) / 1000);
  metrics.fps = Math.round(1 / Math.max(dtSeconds, 0.0001));
  lastFrameMs = nowMs;

  const hands = tracker.ready ? tracker.detect(nowMs, viewport) : [];
  trails.update(hands, nowMs);

  if (game.state === "waiting" && hands.length > 0) {
    startPlay(nowMs);
  }

  if (game.state === "playing") {
    updatePlaying(dtSeconds, nowMs);
    game.flashStrength = Math.max(
      0,
      game.flashStrength - dtSeconds * CONFIG.flashDecayPerSecond
    );
  } else if (game.state === "gameover") {
    updateGameOver(dtSeconds, nowMs);
  }

  devPanel.update();
  render(nowMs, hands);
  requestAnimationFrame(animate);
}

async function init() {
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointerdown", () => audio.unlock(), { passive: true });
  requestAnimationFrame(animate);

  window.addEventListener("error", (event) => {
    console.error(event.error ?? event.message);
    if (game.state === "loading") {
      game.state = "error";
      game.statusText = "startup failed";
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error(event.reason);
    if (game.state === "loading") {
      game.state = "error";
      game.statusText = "startup failed";
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    audio.unlock();
    if (game.state !== "gameover" || !game.restartButton) {
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

  try {
    await tracker.start((statusText) => {
      game.statusText = statusText;
    });
    game.state = "waiting";
    game.statusText = "show your hands";
  } catch (error) {
    console.error(error);
    game.state = "error";
    game.statusText =
      error instanceof Error && error.message
        ? error.message
        : "camera or model setup failed";
  }
}

init();
