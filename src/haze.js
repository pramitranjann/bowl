import { CONFIG } from "./config.js";

export function applyHaze(sourceCanvas, targetCtx, nowMs, viewport, enabled) {
  if (!enabled || !CONFIG.hazeEnabled) {
    targetCtx.drawImage(sourceCanvas, 0, 0, viewport.width, viewport.height);
    return;
  }

  const scaleX = sourceCanvas.width / viewport.width;
  const scaleY = sourceCanvas.height / viewport.height;
  const bandHeight = Math.ceil(viewport.height / CONFIG.hazeBandCount);
  for (let band = 0; band < CONFIG.hazeBandCount; band += 1) {
    const y = band * bandHeight;
    const offset =
      Math.sin(nowMs / CONFIG.hazeWavePeriodMs + band * 1.3) *
      CONFIG.hazeAmplitude;
    targetCtx.drawImage(
      sourceCanvas,
      0,
      y * scaleY,
      viewport.width * scaleX,
      bandHeight * scaleY,
      offset,
      y,
      viewport.width,
      bandHeight
    );
  }
}
