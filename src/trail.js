import { CONFIG } from "./config.js";

const TRAIL_PALETTES = {
  Left: {
    glow: "rgba(197, 216, 109, 0.22)",
    core: "rgba(197, 216, 109, 0.74)",
    edge: "rgba(244, 235, 217, 0.92)",
    blade: "rgba(244, 235, 217, 0.5)",
  },
  Right: {
    glow: "rgba(217, 68, 35, 0.18)",
    core: "rgba(230, 168, 92, 0.72)",
    edge: "rgba(244, 235, 217, 0.9)",
    blade: "rgba(244, 235, 217, 0.46)",
  },
  default: {
    glow: "rgba(244, 235, 217, 0.18)",
    core: "rgba(244, 235, 217, 0.7)",
    edge: "rgba(244, 235, 217, 0.9)",
    blade: "rgba(244, 235, 217, 0.42)",
  },
};

function pointDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function pathVelocity(from, to, dtMs) {
  if (dtMs <= 0) {
    return 0;
  }
  return (pointDistance(from, to) / dtMs) * 1000;
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function getTrailPalette(label) {
  return TRAIL_PALETTES[label] ?? TRAIL_PALETTES.default;
}

function strokeTrailPath(ctx, points, width, strokeStyle) {
  if (points.length < 2) {
    return;
  }

  ctx.lineWidth = width;
  ctx.strokeStyle = strokeStyle;
  ctx.beginPath();
  ctx.moveTo(points[0].sliceX, points[0].sliceY);

  for (let i = 1; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.sliceX + next.sliceX) * 0.5;
    const midY = (current.sliceY + next.sliceY) * 0.5;
    ctx.quadraticCurveTo(current.sliceX, current.sliceY, midX, midY);
  }

  const tail = points[points.length - 1];
  ctx.lineTo(tail.sliceX, tail.sliceY);
  ctx.stroke();
}

function getTrailIntensity(points) {
  let peakVelocity = 0;

  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    const dtMs = current.time - previous.time;
    if (dtMs <= 0) {
      continue;
    }

    peakVelocity = Math.max(
      peakVelocity,
      pathVelocity(
        { x: previous.sliceX, y: previous.sliceY },
        { x: current.sliceX, y: current.sliceY },
        dtMs
      ),
      pathVelocity(
        { x: previous.rawBladeStartX, y: previous.rawBladeStartY },
        { x: current.rawBladeStartX, y: current.rawBladeStartY },
        dtMs
      ),
      pathVelocity(
        { x: previous.rawBladeEndX, y: previous.rawBladeEndY },
        { x: current.rawBladeEndX, y: current.rawBladeEndY },
        dtMs
      )
    );
  }

  return clamp01(peakVelocity / Math.max(CONFIG.sliceVelocityThreshold * 1.2, 1));
}

export class TrailSystem {
  constructor() {
    this.hands = new Map();
    this.liteMode = false;
  }

  clear() {
    this.hands.clear();
  }

  setLiteMode(liteMode) {
    this.liteMode = liteMode;
  }

  update(handPoints, nowMs) {
    const activeIds = new Set();
    const minDistance = this.liteMode
      ? CONFIG.trailMinDistance * CONFIG.trailLiteDistanceMultiplier
      : CONFIG.trailMinDistance;
    const pointBudget = this.liteMode
      ? Math.max(8, Math.round(CONFIG.trailMaxPoints * CONFIG.trailLitePointFactor))
      : CONFIG.trailMaxPoints;

    for (const hand of handPoints) {
      activeIds.add(hand.id);
      const sliceX = hand.rawX ?? hand.x;
      const sliceY = hand.rawY ?? hand.y;
      const rawBladeStartX = hand.rawBladeStartX ?? sliceX;
      const rawBladeStartY = hand.rawBladeStartY ?? sliceY;
      const rawBladeEndX = hand.rawBladeEndX ?? sliceX;
      const rawBladeEndY = hand.rawBladeEndY ?? sliceY;
      const existing =
        this.hands.get(hand.id) ?? {
          id: hand.id,
          label: hand.label,
          color: hand.color,
          points: [],
        };

      const previous = existing.points[existing.points.length - 1];
      if (
        !previous ||
        pointDistance(
          { x: previous.sliceX, y: previous.sliceY },
          { x: sliceX, y: sliceY }
        ) >= minDistance
      ) {
        existing.points.push({
          x: hand.x,
          y: hand.y,
          sliceX,
          sliceY,
          bladeStartX: hand.bladeStartX ?? hand.x,
          bladeStartY: hand.bladeStartY ?? hand.y,
          bladeEndX: hand.bladeEndX ?? hand.x,
          bladeEndY: hand.bladeEndY ?? hand.y,
          rawBladeStartX,
          rawBladeStartY,
          rawBladeEndX,
          rawBladeEndY,
          time: nowMs,
        });
      } else {
        previous.x = hand.x;
        previous.y = hand.y;
        previous.sliceX = sliceX;
        previous.sliceY = sliceY;
        previous.bladeStartX = hand.bladeStartX ?? hand.x;
        previous.bladeStartY = hand.bladeStartY ?? hand.y;
        previous.bladeEndX = hand.bladeEndX ?? hand.x;
        previous.bladeEndY = hand.bladeEndY ?? hand.y;
        previous.rawBladeStartX = rawBladeStartX;
        previous.rawBladeStartY = rawBladeStartY;
        previous.rawBladeEndX = rawBladeEndX;
        previous.rawBladeEndY = rawBladeEndY;
        previous.time = nowMs;
      }

      existing.label = hand.label;
      existing.color = hand.color;
      existing.points = existing.points
        .filter((point) => nowMs - point.time <= CONFIG.trailDecayMs)
        .slice(-pointBudget);

      this.hands.set(hand.id, existing);
    }

    for (const [id, trail] of this.hands.entries()) {
      if (!activeIds.has(id)) {
        trail.points = trail.points.filter(
          (point) => nowMs - point.time <= CONFIG.trailDecayMs
        );
        if (trail.points.length === 0) {
          this.hands.delete(id);
        }
      }
    }
  }

  getSegments() {
    const segments = [];
    for (const trail of this.hands.values()) {
      for (let i = 1; i < trail.points.length; i += 1) {
        const a = trail.points[i - 1];
        const b = trail.points[i];
        const dtMs = b.time - a.time;
        if (dtMs <= 0) {
          continue;
        }
        const centerFrom = { x: a.sliceX, y: a.sliceY };
        const centerTo = { x: b.sliceX, y: b.sliceY };
        const startFrom = { x: a.rawBladeStartX, y: a.rawBladeStartY };
        const startTo = { x: b.rawBladeStartX, y: b.rawBladeStartY };
        const endFrom = { x: a.rawBladeEndX, y: a.rawBladeEndY };
        const endTo = { x: b.rawBladeEndX, y: b.rawBladeEndY };
        const bladeSpanRadius = Math.max(
          6,
          CONFIG.slicePathRadius ?? CONFIG.sliceBladeHalfWidth * 0.9
        );
        segments.push({
          handId: trail.id,
          color: trail.color,
          from: centerFrom,
          to: centerTo,
          paths: [
            {
              from: centerFrom,
              to: centerTo,
              radius: bladeSpanRadius,
            },
            {
              from: startFrom,
              to: startTo,
              radius: bladeSpanRadius,
            },
            {
              from: endFrom,
              to: endTo,
              radius: bladeSpanRadius,
            },
            {
              from: { x: b.rawBladeStartX, y: b.rawBladeStartY },
              to: { x: b.rawBladeEndX, y: b.rawBladeEndY },
              radius: bladeSpanRadius * 0.65,
            },
            {
              from: { x: a.rawBladeStartX, y: a.rawBladeStartY },
              to: { x: b.rawBladeEndX, y: b.rawBladeEndY },
              radius: bladeSpanRadius * 0.5,
            },
            {
              from: { x: a.rawBladeEndX, y: a.rawBladeEndY },
              to: { x: b.rawBladeStartX, y: b.rawBladeStartY },
              radius: bladeSpanRadius * 0.5,
            },
          ],
          velocity: Math.max(
            pathVelocity(centerFrom, centerTo, dtMs),
            pathVelocity(startFrom, startTo, dtMs),
            pathVelocity(endFrom, endTo, dtMs)
          ),
        });
      }
    }
    return segments;
  }

  render(ctx, nowMs) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const trail of this.hands.values()) {
      if (trail.points.length < 2) {
        continue;
      }

      const head = trail.points[trail.points.length - 1];
      const life = clamp01(1 - (nowMs - head.time) / CONFIG.trailDecayMs);
      const speedBoost = getTrailIntensity(trail.points);
      const palette = getTrailPalette(trail.label);
      const glowWidth = Math.max(8, CONFIG.trailWidth * (1.2 + speedBoost * 0.7));
      const washWidth = Math.max(4, CONFIG.trailWidth * (0.78 + speedBoost * 0.16));
      const edgeWidth = Math.max(2.5, CONFIG.trailWidth * 0.26);

      ctx.globalCompositeOperation = "screen";
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 18 + speedBoost * 16;

      ctx.globalAlpha = life * 0.34;
      strokeTrailPath(ctx, trail.points, glowWidth, palette.glow);

      ctx.globalAlpha = life * (0.52 + speedBoost * 0.14);
      strokeTrailPath(ctx, trail.points, washWidth, palette.core);

      ctx.shadowBlur = 0;
      ctx.globalAlpha = life * 0.88;
      strokeTrailPath(ctx, trail.points, edgeWidth, palette.edge);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = life * (0.38 + speedBoost * 0.18);
      ctx.strokeStyle = palette.blade;
      ctx.lineWidth = Math.max(1.6, CONFIG.trailWidth * 0.18);
      ctx.beginPath();
      ctx.moveTo(head.rawBladeStartX, head.rawBladeStartY);
      ctx.lineTo(head.rawBladeEndX, head.rawBladeEndY);
      ctx.stroke();
    }

    ctx.restore();
  }
}
