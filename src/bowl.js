import { CONFIG } from "./config.js";

const BOWL_COLORS = {
  cream: "rgba(244, 235, 217, 0.78)",
  shell: "#7f5636",
  shellShadow: "#58341d",
  shellHighlight: "rgba(244, 235, 217, 0.18)",
  ink: "#2a1f18",
  muted: "rgba(42, 31, 24, 0.58)",
  surface: "rgba(244, 235, 217, 0.92)",
};

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

export class BowlSystem {
  constructor() {
    this.collected = [];
    this.composed = [];
  }

  reset() {
    this.collected = [];
    this.composed = [];
  }

  push(entity) {
    if (entity.kind !== "fruit") {
      return;
    }

    this.collected.push({
      type: entity.type,
      color: entity.data.juiceColor,
      radius: entity.radius,
    });
  }

  compose(viewport) {
    const centerX = viewport.width * 0.5;
    const centerY = viewport.height * CONFIG.bowlCenterYRatio;
    const bowlRadius = CONFIG.bowlRadius;
    const angleStep = Math.PI / Math.max(4, this.collected.length);
    this.composed = this.collected
      .map((fruit, index) => {
      const ring = Math.floor(index / 6);
      const ringRadius = Math.max(
        0,
        bowlRadius * 0.14 + ring * bowlRadius * 0.16
      );
      const angle = index * angleStep + ring * 0.37;
      const radius = fruit.radius * CONFIG.bowlFruitPadding;
      return {
        ...fruit,
        x:
          centerX +
          Math.cos(angle) * ringRadius +
          Math.sin(index * 1.7) * bowlRadius * 0.03,
        y:
          centerY +
          Math.sin(angle) * ringRadius * 0.52 +
          Math.cos(index * 1.3) * bowlRadius * 0.02,
        radius,
        delayMs: index * CONFIG.bowlRevealStaggerMs,
      };
      })
      .sort((a, b) => a.y - b.y);
    return this.composed;
  }

  render(ctx, viewport, nowMs, gameOverAt, score) {
    const centerX = viewport.width * 0.5;
    const centerY = viewport.height * CONFIG.bowlCenterYRatio;
    const bowlRadius = CONFIG.bowlRadius;
    const elapsed = nowMs - gameOverAt;
    const bowlAlpha = easeOutCubic(
      Math.min(1, elapsed / CONFIG.bowlCompositionPassDurationMs)
    );

    ctx.save();
    ctx.globalAlpha = bowlAlpha * 0.92;
    ctx.fillStyle = BOWL_COLORS.cream;
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    ctx.globalAlpha = bowlAlpha;
    ctx.shadowColor = "rgba(42, 31, 24, 0.18)";
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 18;
    ctx.fillStyle = BOWL_COLORS.shell;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, bowlRadius, bowlRadius * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = BOWL_COLORS.shellShadow;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 10, bowlRadius * 0.84, bowlRadius * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = BOWL_COLORS.shellHighlight;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - bowlRadius * 0.1, bowlRadius * 0.62, bowlRadius * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    for (const fruit of this.composed) {
      const fruitAlpha = easeOutCubic(
        Math.min(1, Math.max(0, elapsed - fruit.delayMs) / 260)
      );
      if (fruitAlpha <= 0) {
        continue;
      }
      ctx.globalAlpha = bowlAlpha * fruitAlpha;
      ctx.shadowColor = "rgba(42, 31, 24, 0.14)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = fruit.color;
      ctx.beginPath();
      ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(244, 235, 217, 0.45)";
      ctx.lineWidth = Math.max(1.2, fruit.radius * 0.06);
      ctx.beginPath();
      ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = bowlAlpha;
    ctx.fillStyle = BOWL_COLORS.ink;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.font = '400 92px "Reenie Beanie", cursive';
    ctx.fillText(`${score}`, centerX, centerY - bowlRadius - 86);
    ctx.font = '400 italic 22px "Fraunces", Georgia, serif';
    ctx.fillStyle = BOWL_COLORS.muted;
    ctx.fillText("a bowl of fruit", centerX, centerY - bowlRadius - 18);
    ctx.font = '400 56px "Reenie Beanie", cursive';
    ctx.fillStyle = BOWL_COLORS.ink;
    ctx.fillText("again?", centerX, centerY + bowlRadius + 36);
    ctx.restore();
  }
}
