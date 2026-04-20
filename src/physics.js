import { CONFIG } from "./config.js";

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function behaviorVelocityModifiers(behavior) {
  switch (behavior) {
    case "heavy":
      return { peakScale: 0.88, horizontalScale: 0.8 };
    case "slow":
      return { peakScale: 0.95, horizontalScale: 0.72 };
    case "fast":
      return { peakScale: 1.1, horizontalScale: 1.22 };
    case "large":
      return { peakScale: 0.94, horizontalScale: 0.92 };
    default:
      return { peakScale: 1, horizontalScale: 1 };
  }
}

export function createLaunchVector({ viewport, data, wave, slotIndex, slotCount }) {
  const spawnY = viewport.height + CONFIG.fruitSpawnYOffset;
  const spreadUnit = slotCount > 1 ? slotIndex / (slotCount - 1) : 0.5;
  const edgePadding = viewport.width * 0.15;
  const pattern = wave.burstPattern ?? "scattered";

  let x;
  if (pattern === "line") {
    x = edgePadding + spreadUnit * (viewport.width - edgePadding * 2);
  } else if (pattern === "cluster") {
    x = viewport.width * 0.5 + (spreadUnit - 0.5) * viewport.width * 0.18;
  } else if (pattern === "arc") {
    x = edgePadding + spreadUnit * (viewport.width - edgePadding * 2);
  } else {
    x = randomBetween(edgePadding, viewport.width - edgePadding);
  }

  const variance =
    1 + randomBetween(-CONFIG.fruitArcPeakVariance, CONFIG.fruitArcPeakVariance);
  const modifiers = behaviorVelocityModifiers(data.behavior);
  const peakY =
    viewport.height *
    randomBetween(0.16, 0.34) *
    modifiers.peakScale *
    variance;
  const riseDistance = Math.max(120, spawnY - peakY);
  const vy = -Math.sqrt(2 * CONFIG.gravity * riseDistance);

  const targetX =
    viewport.width * 0.5 + (Math.random() - 0.5) * viewport.width * 0.32;
  const estimatedFlight = (-2 * vy) / CONFIG.gravity;
  const baseVx = (targetX - x) / Math.max(estimatedFlight, 1);
  const drift = (Math.random() - 0.5) * 120;
  const vx = (baseVx + drift) * modifiers.horizontalScale;

  return { x, y: spawnY, vx, vy };
}

export function updateBody(body, dtSeconds) {
  body.update(dtSeconds, CONFIG.gravity);
}

export function isBodyOffscreen(body, viewport) {
  return (
    body.y - body.radius > viewport.height + CONFIG.fruitCullPadding ||
    body.x < -CONFIG.fruitCullPadding ||
    body.x > viewport.width + CONFIG.fruitCullPadding
  );
}
