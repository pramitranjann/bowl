import { CONFIG } from "./config.js";

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function hexToRgb(color) {
  const normalized = color.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((value) => value + value)
          .join("")
      : normalized;
  const value = Number.parseInt(expanded, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function withAlpha(color, alpha) {
  if (color.startsWith("rgba")) {
    return color.replace(/rgba\((.+),\s*[\d.]+\)/, "rgba($1, " + alpha + ")");
  }
  if (color.startsWith("rgb")) {
    return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export class Particle {
  constructor({
    x,
    y,
    vx,
    vy,
    radius,
    color,
    lifeMs = CONFIG.particleLifeMs,
    bornAt = performance.now(),
  }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.lifeMs = lifeMs;
    this.ageMs = performance.now() - bornAt;
    this.drift = randomBetween(-0.7, 0.7);
    this.seed = Math.random() * Math.PI * 2;
    this.dead = false;
  }

  update(dtSeconds) {
    this.x += this.vx * dtSeconds;
    this.y += this.vy * dtSeconds;
    this.vy += CONFIG.particleGravity * dtSeconds;
    this.ageMs += dtSeconds * 1000;
    if (this.ageMs >= this.lifeMs) {
      this.dead = true;
    }
  }

  render(ctx) {
    const lifeRatio = Math.max(0, 1 - this.ageMs / this.lifeMs);
    const wobble = Math.sin(this.seed + this.ageMs * 0.015) * this.drift * this.radius;
    const drawX = this.x + wobble;
    const drawY = this.y;
    const outerRadius = this.radius * (1.2 + lifeRatio * 0.65);
    const gradient = ctx.createRadialGradient(
      drawX - this.radius * 0.18,
      drawY - this.radius * 0.18,
      this.radius * 0.12,
      drawX,
      drawY,
      outerRadius
    );
    gradient.addColorStop(0, withAlpha("#ffffff", lifeRatio * 0.38));
    gradient.addColorStop(0.18, withAlpha(this.color, lifeRatio * 0.95));
    gradient.addColorStop(0.72, withAlpha(this.color, lifeRatio * 0.28));
    gradient.addColorStop(1, withAlpha(this.color, 0));

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(drawX, drawY, outerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function createJuiceBurst({ x, y, color, behavior, intensity = 1 }) {
  const multiplier = behavior === "splatter" ? 2 : 1;
  const burstScale = Math.min(1.8, Math.max(0.75, intensity));
  const count = Math.round(CONFIG.particleBaseCount * multiplier * burstScale);
  const particles = [];

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed =
      randomBetween(90, 360) *
      (behavior === "splatter" ? 1.2 : 1) *
      burstScale;
    particles.push(
      new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - randomBetween(60, 180),
        radius: randomBetween(CONFIG.particleMinSize, CONFIG.particleMaxSize),
        color,
      })
    );
  }

  return particles;
}

export function createDurianBurst({ x, y, color }) {
  const particles = [];
  for (let i = 0; i < 30; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(140, 420);
    particles.push(
      new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - randomBetween(40, 220),
        radius: randomBetween(3, 9),
        color,
      })
    );
  }
  return particles;
}
