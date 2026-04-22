import { CONFIG } from "./config.js";

const BOWL_COLORS = {
  cream: "rgba(244, 235, 217, 0.78)",
  creamSoft: "rgba(244, 235, 217, 0.56)",
  shell: "#7f5636",
  shellShadow: "#58341d",
  shellHighlight: "rgba(244, 235, 217, 0.18)",
  ink: "#2a1f18",
  muted: "rgba(42, 31, 24, 0.58)",
  surface: "rgba(244, 235, 217, 0.92)",
  pandan: "#c5d86d",
};

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
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

  render(ctx, viewport, nowMs, gameOverAt, score, restartButton = null, restartProgress = 0) {
    const centerX = viewport.width * 0.5;
    const centerY = viewport.height * CONFIG.bowlCenterYRatio;
    const bowlRadius = CONFIG.bowlRadius;
    const elapsed = nowMs - gameOverAt;
    const bowlAlpha = easeOutCubic(
      Math.min(1, elapsed / CONFIG.bowlCompositionPassDurationMs)
    );

    ctx.save();
    ctx.globalAlpha = bowlAlpha * 0.94;
    const wash = ctx.createRadialGradient(
      centerX,
      centerY - bowlRadius * 0.55,
      bowlRadius * 0.2,
      centerX,
      centerY,
      viewport.height * 0.72
    );
    wash.addColorStop(0, BOWL_COLORS.cream);
    wash.addColorStop(1, "rgba(244, 235, 217, 0.92)");
    ctx.fillStyle = wash;
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

    ctx.fillStyle = BOWL_COLORS.creamSoft;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + bowlRadius * 0.52, bowlRadius * 0.92, bowlRadius * 0.18, 0, 0, Math.PI * 2);
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
    ctx.font = '400 112px "Reenie Beanie", cursive';
    ctx.fillText(`${score}`, centerX, centerY - bowlRadius - 110);
    ctx.font = '400 italic 22px "Fraunces", Georgia, serif';
    ctx.fillStyle = BOWL_COLORS.muted;
    ctx.fillText("a bowl of fruit", centerX, centerY - bowlRadius - 28);
    ctx.strokeStyle = BOWL_COLORS.pandan;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(centerX - 82, centerY - bowlRadius - 8);
    ctx.quadraticCurveTo(centerX, centerY - bowlRadius + 18, centerX + 76, centerY - bowlRadius - 4);
    ctx.stroke();
    if (restartButton) {
      ctx.save();
      ctx.translate(
        restartButton.x + restartButton.width / 2,
        restartButton.y + restartButton.height / 2
      );
      ctx.rotate(-0.018);
      const buttonFill = restartProgress > 0
        ? `rgba(197, 216, 109, ${0.72 + restartProgress * 0.16})`
        : BOWL_COLORS.surface;
      ctx.fillStyle = buttonFill;
      ctx.strokeStyle = "rgba(42, 31, 24, 0.08)";
      ctx.lineWidth = 1;
      drawRoundedRect(
        ctx,
        -restartButton.width / 2,
        -restartButton.height / 2,
        restartButton.width,
        restartButton.height,
        restartButton.height / 2
      );
      ctx.fill();
      ctx.stroke();

      ctx.font = '400 56px "Reenie Beanie", cursive';
      ctx.fillStyle = BOWL_COLORS.ink;
      ctx.fillText(
        "again?",
        0,
        -restartButton.height / 2 + 14
      );
      ctx.restore();
    }
    ctx.restore();
  }
}
