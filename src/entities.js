import { CONFIG } from "./config.js";

export const FRUITS = {
  watermelon: {
    sizeMult: 1.4,
    weight: 1.4,
    score: 10,
    juiceColor: "#e63946",
    behavior: "heavy",
    wobbleAmp: 0.02,
  },
  pineapple: {
    sizeMult: 1.3,
    weight: 1.3,
    score: 12,
    juiceColor: "#f4c430",
    behavior: "slow",
    wobbleAmp: 0.03,
  },
  mango: {
    sizeMult: 1.0,
    weight: 1.0,
    score: 10,
    juiceColor: "#ffa94d",
    behavior: "default",
    wobbleAmp: 0.05,
  },
  papaya: {
    sizeMult: 1.2,
    weight: 1.1,
    score: 10,
    juiceColor: "#ff6b35",
    behavior: "large",
    wobbleAmp: 0.04,
  },
  dragonfruit: {
    sizeMult: 1.0,
    weight: 1.0,
    score: 15,
    juiceColor: "#d81b7a",
    behavior: "splatter",
    wobbleAmp: 0.05,
  },
  mangosteen: {
    sizeMult: 0.8,
    weight: 0.9,
    score: 15,
    juiceColor: "#6a4c93",
    behavior: "reveal",
    wobbleAmp: 0.06,
  },
  rambutan: {
    sizeMult: 0.6,
    weight: 0.6,
    score: 20,
    juiceColor: "#c1121f",
    behavior: "fast",
    wobbleAmp: 0.08,
  },
  starfruit: {
    sizeMult: 0.9,
    weight: 0.8,
    score: 15,
    juiceColor: "#fcd34d",
    behavior: "spin",
    wobbleAmp: 0.1,
  },
  lychee: {
    sizeMult: 0.5,
    weight: 0.5,
    score: 20,
    juiceColor: "#fecaca",
    behavior: "cluster",
    wobbleAmp: 0.08,
  },
  guava: {
    sizeMult: 0.9,
    weight: 0.9,
    score: 10,
    juiceColor: "#fca5a5",
    behavior: "default",
    wobbleAmp: 0.05,
  },
};

export const DURIAN = {
  sizeMult: 1.2,
  weight: 1.2,
  score: 0,
  warningColor: "#c5c533",
  behavior: "warning",
  wobbleAmp: 0.02,
};

export const FRUIT_TYPES = Object.keys(FRUITS);

let entityId = 0;

export class FlyingEntity {
  constructor({
    kind,
    type,
    data,
    x,
    y,
    vx,
    vy,
    radius,
    spin = 0,
    rotation = 0,
    bornAt = 0,
  }) {
    this.id = `${kind}-${entityId += 1}`;
    this.kind = kind;
    this.type = type;
    this.data = data;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.spin = spin;
    this.rotation = rotation;
    this.bornAt = bornAt;
    this.wobbleSeed = Math.random() * Math.PI * 2;
    this.dead = false;
  }

  update(dtSeconds, gravity) {
    this.x += this.vx * dtSeconds;
    this.y += this.vy * dtSeconds;
    this.vy += gravity * dtSeconds;
    this.rotation += this.spin * dtSeconds;
  }

  render(ctx, nowMs) {
    const wobble =
      Math.sin(nowMs * 0.004 + this.wobbleSeed) *
      this.radius *
      (this.data.wobbleAmp ?? 0.03);

    ctx.save();
    ctx.translate(this.x, this.y + wobble);
    ctx.rotate(this.rotation);

    if (this.kind === "durian") {
      ctx.fillStyle = "#826248";
      ctx.strokeStyle = this.data.warningColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i < 14; i += 1) {
        const angle = (i / 14) * Math.PI * 2;
        const inner = this.radius * 0.85;
        const outer = this.radius * 1.12;
        const x1 = Math.cos(angle) * inner;
        const y1 = Math.sin(angle) * inner;
        const x2 = Math.cos(angle) * outer;
        const y2 = Math.sin(angle) * outer;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();
    } else {
      ctx.fillStyle = this.data.juiceColor;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export class SliceHalf {
  constructor({
    x,
    y,
    vx,
    vy,
    radius,
    color,
    side,
    bornAt,
    spin,
  }) {
    this.id = `half-${entityId += 1}`;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.side = side;
    this.bornAt = bornAt;
    this.spin = spin;
    this.rotation = side === "left" ? -0.15 : 0.15;
    this.dead = false;
  }

  update(dtSeconds, gravity) {
    this.x += this.vx * dtSeconds;
    this.y += this.vy * dtSeconds;
    this.vy += gravity * dtSeconds;
    this.rotation += this.spin * dtSeconds;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    if (this.side === "left") {
      ctx.arc(0, 0, this.radius, Math.PI / 2, (Math.PI * 3) / 2);
    } else {
      ctx.arc(0, 0, this.radius, -Math.PI / 2, Math.PI / 2);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = Math.max(2, this.radius * 0.06);
    ctx.beginPath();
    ctx.moveTo(0, -this.radius * 0.96);
    ctx.lineTo(0, this.radius * 0.96);
    ctx.stroke();

    ctx.restore();
  }
}

export function createEntity({ kind, type, x, y, vx, vy, bornAt }) {
  const data = kind === "durian" ? DURIAN : FRUITS[type];
  const radius = (CONFIG.fruitBaseSize * data.sizeMult) / 2;
  const spin =
    data.behavior === "spin"
      ? 2.8
      : (Math.random() - 0.5) * (kind === "durian" ? 0.8 : 1.6);

  return new FlyingEntity({
    kind,
    type,
    data,
    x,
    y,
    vx,
    vy,
    radius,
    spin,
    rotation: Math.random() * Math.PI * 2,
    bornAt,
  });
}

export function splitFruit(entity, point, nowMs) {
  const baseVx = entity.vx * 0.55;
  const baseVy = entity.vy * 0.65;
  const escape = Math.max(260, entity.radius * 3.1);
  const radius = entity.radius * 0.72;
  const color = entity.data.juiceColor;
  const offset = entity.radius * 0.34;

  return [
    new SliceHalf({
      x: point.x - offset,
      y: point.y,
      vx: baseVx - escape,
      vy: baseVy - 140,
      radius,
      color,
      side: "left",
      bornAt: nowMs,
      spin: -3.2,
    }),
    new SliceHalf({
      x: point.x + offset,
      y: point.y,
      vx: baseVx + escape,
      vy: baseVy - 140,
      radius,
      color,
      side: "right",
      bornAt: nowMs,
      spin: 3.2,
    }),
  ];
}
