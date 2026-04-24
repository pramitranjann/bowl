import { CONFIG } from "./config.js";
import { MODE_META, MODES } from "./states.js";

const HUD_COLORS = {
  ink: "#2a1f18",
  cream: "rgba(244, 235, 217, 0.9)",
  creamSoft: "rgba(244, 235, 217, 0.72)",
  pandan: "#c5d86d",
  hibiscus: "#d94423",
  muted: "rgba(42, 31, 24, 0.56)",
  shadow: "rgba(42, 31, 24, 0.18)",
  border: "rgba(42, 31, 24, 0.08)",
};

let _lastScore = undefined;
let _scoreBloomUntil = 0;

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawPaperSwash(ctx, x, y, width, height, color, rotation = 0) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(rotation);
  ctx.shadowColor = HUD_COLORS.shadow;
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(-width * 0.08, -height * 0.04, width * 0.36, height * 0.24, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
}

function drawDurianIcon(ctx, cx, cy, size, active) {
  ctx.save();
  ctx.globalAlpha = active ? 1.0 : 0.22;
  ctx.fillStyle = active ? HUD_COLORS.pandan : HUD_COLORS.muted;

  // Body oval
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.06, size * 0.38, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spikes: [tipX, tipY, base1X, base1Y, base2X, base2Y] as multiples of size
  const spikes = [
    [0, -0.5, -0.12, -0.16, 0.12, -0.16],
    [0.48, -0.3, 0.16, -0.06, 0.34, 0.14],
    [0.46, 0.24, 0.12, 0.1, 0.26, 0.36],
    [-0.46, 0.24, -0.12, 0.1, -0.26, 0.36],
    [-0.48, -0.3, -0.16, -0.06, -0.34, 0.14],
  ];

  for (const [tx, ty, b1x, b1y, b2x, b2y] of spikes) {
    ctx.beginPath();
    ctx.moveTo(cx + tx * size, cy + ty * size);
    ctx.lineTo(cx + b1x * size, cy + b1y * size);
    ctx.lineTo(cx + b2x * size, cy + b2y * size);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

export function renderHud(ctx, { score, livesLost, width, mode, remainingMs }) {
  if (score !== _lastScore && _lastScore !== undefined) {
    _scoreBloomUntil = performance.now() + 600;
    const card = document.querySelector('.ui-score-card');
    if (card) {
      card.classList.remove('is-blooming');
      void card.offsetWidth;
      card.classList.add('is-blooming');
      card.addEventListener('animationend', () => card.classList.remove('is-blooming'), { once: true });
    }
  }
  _lastScore = score;

  const padding = CONFIG.hudPadding;
  const modeLabel = MODE_META[mode]?.label ?? mode;
  const modeRect = { x: padding - 10, y: padding - 2, width: 138, height: 48 };
  const scoreX = padding + 4;
  const scoreY = padding + 72;
  const timedRect = { x: width / 2 - 92, y: padding + 6, width: 184, height: 50 };
  const livesRect = { x: width - padding - 128, y: padding + 8, width: 120, height: 42 };

  ctx.save();
  ctx.textBaseline = "middle";

  drawPaperSwash(ctx, modeRect.x, modeRect.y, modeRect.width, modeRect.height, HUD_COLORS.cream, -0.03);
  ctx.fillStyle = HUD_COLORS.ink;
  ctx.textAlign = "center";
  ctx.font = '400 34px "Reenie Beanie", cursive';
  ctx.fillText(modeLabel, modeRect.x + modeRect.width / 2, modeRect.y + modeRect.height / 2 + 1);

  ctx.strokeStyle = HUD_COLORS.pandan;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(scoreX - 2, scoreY + 12);
  ctx.quadraticCurveTo(scoreX + 38, scoreY + 22, scoreX + 84, scoreY + 8);
  ctx.stroke();
  ctx.fillStyle = HUD_COLORS.muted;
  ctx.textAlign = "left";
  ctx.font = '400 28px "Reenie Beanie", cursive';
  ctx.fillText("score", scoreX, scoreY - 18);
  const blooming = performance.now() < _scoreBloomUntil;
  if (blooming) {
    ctx.save();
    ctx.shadowColor = HUD_COLORS.pandan;
    ctx.shadowBlur = 16;
  }
  ctx.fillStyle = HUD_COLORS.ink;
  ctx.font = '400 70px "Reenie Beanie", cursive';
  ctx.fillText(`${score}`, scoreX, scoreY + 12);
  if (blooming) ctx.restore();

  ctx.font = '400 28px "Reenie Beanie", cursive';
  if (mode === MODES.TIMED && Number.isFinite(remainingMs)) {
    drawPaperSwash(ctx, timedRect.x, timedRect.y, timedRect.width, timedRect.height, HUD_COLORS.creamSoft, 0.015);
    ctx.textAlign = "center";
    ctx.fillStyle = HUD_COLORS.muted;
    ctx.font = '400 24px "Reenie Beanie", cursive';
    ctx.fillText("time", width / 2, timedRect.y + 16);
    ctx.fillStyle = HUD_COLORS.ink;
    ctx.font = '400 34px "Reenie Beanie", cursive';
    ctx.fillText(formatRemaining(remainingMs), width / 2, timedRect.y + 34);
  } else if (mode === MODES.SUNSET) {
    ctx.restore();
    return;
  } else {
    drawPaperSwash(ctx, livesRect.x, livesRect.y, livesRect.width, livesRect.height, HUD_COLORS.creamSoft, -0.02);
    ctx.textAlign = "center";
    ctx.fillStyle = HUD_COLORS.muted;
    ctx.font = '400 22px "Reenie Beanie", cursive';
    ctx.fillText("durian", livesRect.x + livesRect.width / 2, livesRect.y + 14);
    const iconSize = 20;
    const iconSpacing = 30;
    const totalIconsWidth = iconSpacing * (CONFIG.maxDurianHits - 1);
    const iconsStartX = livesRect.x + livesRect.width / 2 - totalIconsWidth / 2;
    const iconsY = livesRect.y + 32;

    for (let index = 0; index < CONFIG.maxDurianHits; index += 1) {
      const active = index < CONFIG.maxDurianHits - livesLost;
      drawDurianIcon(ctx, iconsStartX + index * iconSpacing, iconsY, iconSize, active);
    }
  }

  ctx.beginPath();
  ctx.fillStyle = HUD_COLORS.hibiscus;
  ctx.arc(modeRect.x + modeRect.width + 14, modeRect.y + 8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
