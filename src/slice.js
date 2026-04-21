import { CONFIG } from "./config.js";

export function segmentIntersectsCircle(from, to, center, radius) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    const distance = Math.hypot(center.x - from.x, center.y - from.y);
    if (distance > radius) {
      return null;
    }
    return { x: from.x, y: from.y };
  }

  const t =
    ((center.x - from.x) * dx + (center.y - from.y) * dy) / lengthSq;
  const clampedT = Math.max(0, Math.min(1, t));
  const closestX = from.x + dx * clampedT;
  const closestY = from.y + dy * clampedT;
  const distance = Math.hypot(center.x - closestX, center.y - closestY);

  if (distance > radius) {
    return null;
  }

  return {
    x: closestX,
    y: closestY,
  };
}

export function detectSlices(segments, entities, velocityThreshold) {
  const hits = [];
  const claimed = new Set();

  for (const segment of segments) {
    if (segment.velocity < velocityThreshold) {
      continue;
    }

    for (const entity of entities) {
      if (claimed.has(entity.id) || entity.dead) {
        continue;
      }

      const paths =
        segment.paths && segment.paths.length
          ? segment.paths
          : [{ from: segment.from, to: segment.to }];
      let point = null;

      for (const path of paths) {
        point = segmentIntersectsCircle(
          path.from,
          path.to,
          entity,
          entity.radius +
            CONFIG.sliceCollisionPadding +
            (path.radius ?? 0)
        );
        if (point) {
          break;
        }
      }

      if (point) {
        claimed.add(entity.id);
        hits.push({ entity, point, segment });
      }
    }
  }

  return hits;
}
