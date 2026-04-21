import { CONFIG } from "./config.js";

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
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
    ctx.save();
    ctx.globalAlpha = lifeRatio;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * (0.7 + lifeRatio * 0.3), 0, Math.PI * 2);
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
