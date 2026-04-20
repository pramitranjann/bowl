import { CONFIG } from "./config.js";

export function renderHud(ctx, { score, livesLost, width }) {
  const padding = CONFIG.hudPadding;
  const lives = Array.from({ length: CONFIG.maxDurianHits }, (_, index) => {
    return index < CONFIG.maxDurianHits - livesLost ? "●" : "○";
  }).join(" ");

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 12;
  ctx.font = CONFIG.scoreFont;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Score ${score}`, padding, padding);

  ctx.font = CONFIG.hudFont;
  ctx.textAlign = "right";
  ctx.fillText(`Durian ${lives}`, width - padding, padding + 2);
  ctx.restore();
}
