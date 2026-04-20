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
      const existing =
        this.hands.get(hand.id) ?? {
          id: hand.id,
          label: hand.label,
          color: hand.color,
          points: [],
        };

      const previous = existing.points[existing.points.length - 1];
      if (!previous || pointDistance(previous, hand) >= CONFIG.trailMinDistance) {
        existing.points.push({
          x: hand.x,
          y: hand.y,
          time: nowMs,
        });
      } else {
        previous.x = hand.x;
        previous.y = hand.y;
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
          from: a,
          to: b,
          velocity: (pointDistance(a, b) / dtMs) * 1000,
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
      }
    }

    ctx.restore();
  }
}
