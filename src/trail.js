import { CONFIG } from "./config.js";

function pointDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export class TrailSystem {
  constructor() {
    this.hands = new Map();
  }

  clear() {
    this.hands.clear();
  }

  update(handPoints, nowMs) {
    const activeIds = new Set();

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
        ) >= CONFIG.trailMinDistance
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
        .slice(-CONFIG.trailMaxPoints);

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
        segments.push({
          handId: trail.id,
          color: trail.color,
          from: { x: a.sliceX, y: a.sliceY },
          to: { x: b.sliceX, y: b.sliceY },
          paths: [
            {
              from: { x: a.sliceX, y: a.sliceY },
              to: { x: b.sliceX, y: b.sliceY },
            },
            {
              from: { x: a.rawBladeStartX, y: a.rawBladeStartY },
              to: { x: b.rawBladeStartX, y: b.rawBladeStartY },
            },
            {
              from: { x: a.rawBladeEndX, y: a.rawBladeEndY },
              to: { x: b.rawBladeEndX, y: b.rawBladeEndY },
            },
            {
              from: { x: b.rawBladeStartX, y: b.rawBladeStartY },
              to: { x: b.rawBladeEndX, y: b.rawBladeEndY },
            },
          ],
          velocity:
            (pointDistance(
              { x: a.sliceX, y: a.sliceY },
              { x: b.sliceX, y: b.sliceY }
            ) /
              dtMs) *
            1000,
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
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        ctx.lineWidth = Math.max(1.5, CONFIG.trailWidth * 0.24 * life);
        ctx.beginPath();
        ctx.moveTo(b.bladeStartX, b.bladeStartY);
        ctx.lineTo(b.bladeEndX, b.bladeEndY);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
