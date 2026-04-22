import { CONFIG } from "./config.js";
import { MODE_META, MODES } from "./states.js";

const HUD_COLORS = {
  ink: "#2a1f18",
  cream: "rgba(244, 235, 217, 0.9)",
  pandan: "#c5d86d",
  muted: "rgba(42, 31, 24, 0.56)",
  shadow: "rgba(42, 31, 24, 0.18)",
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

export function renderHud(ctx, { score, livesLost, width, mode, remainingMs }) {
  const padding = CONFIG.hudPadding;
  const modeLabel = MODE_META[mode]?.label ?? mode;
  const modePillWidth = 122;
  const modePillHeight = 38;
  const topY = padding - 8;
  const modePillX = padding - 8;
  const valueTextY = padding + 6;

  ctx.save();
  ctx.shadowColor = HUD_COLORS.shadow;
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.textBaseline = "top";

  drawRoundedRect(ctx, modePillX, topY, modePillWidth, modePillHeight, 18);
  ctx.fillStyle = HUD_COLORS.cream;
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = HUD_COLORS.ink;
  ctx.textAlign = "left";
  ctx.font = '400 34px "Reenie Beanie", cursive';
  ctx.fillText(modeLabel, padding + 6, padding - 12);

  ctx.font = '400 50px "Reenie Beanie", cursive';
  ctx.textAlign = "left";
  ctx.fillText(`${score}`, padding, valueTextY);

  ctx.font = '500 21px "Fraunces", Georgia, serif';
  ctx.fillStyle = HUD_COLORS.muted;
  ctx.fillText("score", padding + 54, valueTextY + 17);

  ctx.font = '500 21px "Fraunces", Georgia, serif';
  if (mode === MODES.TIMED && Number.isFinite(remainingMs)) {
    ctx.textAlign = "center";
    ctx.fillStyle = HUD_COLORS.ink;
    ctx.fillText(formatRemaining(remainingMs), width / 2, valueTextY + 10);
  } else if (mode === MODES.SUNSET) {
    ctx.restore();
    return;
  } else {
    ctx.textAlign = "right";
    const dotSpacing = 18;
    const totalDotsWidth = dotSpacing * (CONFIG.maxDurianHits - 1);
    const dotsStartX = width - padding - totalDotsWidth;
    const dotsY = valueTextY + 23;

    for (let index = 0; index < CONFIG.maxDurianHits; index += 1) {
      const active = index < CONFIG.maxDurianHits - livesLost;
      ctx.beginPath();
      ctx.fillStyle = active ? HUD_COLORS.pandan : HUD_COLORS.muted;
      ctx.arc(dotsStartX + index * dotSpacing, dotsY, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
