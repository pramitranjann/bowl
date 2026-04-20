import { CONFIG } from "./config.js";
import { MODE_META, MODES } from "./states.js";

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function renderHud(ctx, { score, livesLost, width, mode, remainingMs }) {
  const padding = CONFIG.hudPadding;
  const modeLabel = MODE_META[mode]?.label ?? mode;
  const lives = Array.from({ length: CONFIG.maxDurianHits }, (_, index) => {
    return index < CONFIG.maxDurianHits - livesLost ? "●" : "○";
  }).join(" ");

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 12;
  ctx.textBaseline = "top";
  ctx.font = "18px system-ui, sans-serif";
  ctx.fillText(modeLabel, padding, padding - 18);
  ctx.font = CONFIG.scoreFont;
  ctx.textAlign = "left";
  ctx.fillText(`Score ${score}`, padding, padding);

  ctx.font = CONFIG.hudFont;
  ctx.textAlign = "right";
  if (mode === MODES.TIMED && Number.isFinite(remainingMs)) {
    ctx.fillText(formatRemaining(remainingMs), width - padding, padding + 2);
  } else if (mode === MODES.SUNSET) {
    ctx.fillText("sunset", width - padding, padding + 2);
  } else {
    ctx.fillText(`Durian ${lives}`, width - padding, padding + 2);
  }
  ctx.restore();
}
