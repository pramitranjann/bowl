import { CONFIG } from "./config.js";

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
    this.composed = this.collected.map((fruit, index) => {
      const ring = Math.floor(index / 6);
      const ringRadius = Math.max(
        0,
        bowlRadius * 0.14 + ring * bowlRadius * 0.16
      );
      const angle = index * angleStep + ring * 0.37;
      const radius = fruit.radius * CONFIG.bowlFruitPadding;
      return {
        ...fruit,
        x: centerX + Math.cos(angle) * ringRadius,
        y: centerY + Math.sin(angle) * ringRadius * 0.52,
        radius,
        delayMs: index * CONFIG.bowlRevealStaggerMs,
      };
    });
    return this.composed;
  }

  render(ctx, viewport, nowMs, gameOverAt, score) {
    const centerX = viewport.width * 0.5;
    const centerY = viewport.height * CONFIG.bowlCenterYRatio;
    const bowlRadius = CONFIG.bowlRadius;
    const elapsed = nowMs - gameOverAt;
    const bowlAlpha = Math.min(1, elapsed / CONFIG.bowlCompositionPassDurationMs);

    ctx.save();
    ctx.globalAlpha = bowlAlpha;
    ctx.fillStyle = "#7f5636";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, bowlRadius, bowlRadius * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#58341d";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 10, bowlRadius * 0.84, bowlRadius * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    for (const fruit of this.composed) {
      const fruitAlpha = Math.min(1, Math.max(0, elapsed - fruit.delayMs) / 220);
      if (fruitAlpha <= 0) {
        continue;
      }
      ctx.globalAlpha = bowlAlpha * fruitAlpha;
      ctx.fillStyle = fruit.color;
      ctx.beginPath();
      ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = bowlAlpha;
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 56px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Score ${score}`, centerX, centerY - bowlRadius - 44);
    ctx.font = "400 26px system-ui, sans-serif";
    ctx.fillText("again", centerX, centerY + bowlRadius + 54);
    ctx.restore();
  }
}
