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

export function renderHud(ctx, { score, livesLost, width, mode, remainingMs }) {
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
  ctx.font = '500 15px "Fraunces", Georgia, serif';
  ctx.fillText("score", scoreX, scoreY - 18);
  ctx.fillStyle = HUD_COLORS.ink;
  ctx.font = '400 70px "Reenie Beanie", cursive';
  ctx.fillText(`${score}`, scoreX, scoreY + 12);

  ctx.font = '500 20px "Fraunces", Georgia, serif';
  if (mode === MODES.TIMED && Number.isFinite(remainingMs)) {
    drawPaperSwash(ctx, timedRect.x, timedRect.y, timedRect.width, timedRect.height, HUD_COLORS.creamSoft, 0.015);
    ctx.textAlign = "center";
    ctx.fillStyle = HUD_COLORS.muted;
    ctx.font = '500 14px "Fraunces", Georgia, serif';
    ctx.fillText("time", width / 2, timedRect.y + 16);
    ctx.fillStyle = HUD_COLORS.ink;
    ctx.font = '500 24px "Fraunces", Georgia, serif';
    ctx.fillText(formatRemaining(remainingMs), width / 2, timedRect.y + 34);
  } else if (mode === MODES.SUNSET) {
    ctx.restore();
    return;
  } else {
    drawPaperSwash(ctx, livesRect.x, livesRect.y, livesRect.width, livesRect.height, HUD_COLORS.creamSoft, -0.02);
    ctx.textAlign = "center";
    ctx.fillStyle = HUD_COLORS.muted;
    ctx.font = '500 13px "Fraunces", Georgia, serif';
    ctx.fillText("durian", livesRect.x + livesRect.width / 2, livesRect.y + 14);
    const dotSpacing = 18;
    const totalDotsWidth = dotSpacing * (CONFIG.maxDurianHits - 1);
    const dotsStartX = livesRect.x + livesRect.width / 2 - totalDotsWidth / 2;
    const dotsY = livesRect.y + 30;

    for (let index = 0; index < CONFIG.maxDurianHits; index += 1) {
      const active = index < CONFIG.maxDurianHits - livesLost;
      ctx.beginPath();
      ctx.fillStyle = active ? HUD_COLORS.pandan : HUD_COLORS.muted;
      ctx.arc(dotsStartX + index * dotSpacing, dotsY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.beginPath();
  ctx.fillStyle = HUD_COLORS.hibiscus;
  ctx.arc(modeRect.x + modeRect.width + 14, modeRect.y + 8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
