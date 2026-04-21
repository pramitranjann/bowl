import { CONFIG } from "./config.js";

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

      for (let i = 1; i < trail.points.length; i += 1) {
        const a = trail.points[i - 1];
        const b = trail.points[i];
        const age = nowMs - b.time;
        const life = Math.max(0, 1 - age / CONFIG.trailDecayMs);
        ctx.strokeStyle = trail.color;
        ctx.globalAlpha = life * 0.95;
        ctx.lineWidth = Math.max(2, CONFIG.trailWidth * life);
        ctx.beginPath();
        ctx.moveTo(a.sliceX, a.sliceY);
        ctx.lineTo(b.sliceX, b.sliceY);
        ctx.stroke();

        ctx.lineWidth = Math.max(1.5, CONFIG.trailWidth * 0.24 * life);
        ctx.beginPath();
        ctx.moveTo(b.rawBladeStartX, b.rawBladeStartY);
        ctx.lineTo(b.rawBladeEndX, b.rawBladeEndY);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
