import { CONFIG } from "./config.js";
import { DURIAN, FRUITS, FRUIT_TYPES, createEntity } from "./entities.js";
import { createLaunchVector } from "./physics.js";
import { ENDLESS_WAVES } from "./waves/endless.js";

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export class WaveSpawner {
  constructor() {
    this.waves = ENDLESS_WAVES;
    this.reset(0);
  }

  reset(nowMs) {
    this.waveIndex = 0;
    this.state = "waiting";
    this.waveStartMs = nowMs;
    this.waveReadyAtMs = nowMs + 400;
    this.nextSpawnAtMs = nowMs;
    this.remainingSpawns = 0;
    this.activeWave = null;
    this.totalSpawnsThisWave = 0;
  }

  update(nowMs, viewport) {
    const spawned = [];

    if (this.state === "waiting") {
      if (nowMs >= this.waveReadyAtMs) {
        this.beginWave(nowMs);
      } else {
        return spawned;
      }
    }

    if (!this.activeWave) {
      return spawned;
    }

    while (
      this.state === "active" &&
      this.remainingSpawns > 0 &&
      nowMs >= this.nextSpawnAtMs
    ) {
      const slotIndex = this.totalSpawnsThisWave - this.remainingSpawns;
      spawned.push(this.spawnEntity(viewport, slotIndex));
      this.remainingSpawns -= 1;
      this.nextSpawnAtMs +=
        this.activeWave.spawnDelay * CONFIG.spawnDelayMultiplier * 1000;
    }

    const waveElapsedMs = nowMs - this.waveStartMs;
    const waveDurationMs = this.activeWave.waveDuration * 1000;

    if (
      this.state === "active" &&
      this.remainingSpawns <= 0 &&
      waveElapsedMs >= waveDurationMs
    ) {
      this.state = "waiting";
      this.waveReadyAtMs =
        nowMs + this.activeWave.nextWaveDelay * CONFIG.waveDelayMultiplier * 1000;
      this.activeWave = null;
    }

    return spawned;
  }

  beginWave(nowMs) {
    this.activeWave = this.waves[this.waveIndex];
    this.waveIndex = (this.waveIndex + 1) % this.waves.length;
    this.waveStartMs = nowMs;
    this.remainingSpawns = randomInt(
      this.activeWave.countMin,
      this.activeWave.countMax
    );
    this.totalSpawnsThisWave = this.remainingSpawns;
    this.nextSpawnAtMs = nowMs;
    this.state = "active";
  }

  spawnEntity(viewport, slotIndex) {
    const wave = this.activeWave;
    const kind = pickOne(wave.spawnTypes);
    const type =
      kind === "durian"
        ? "durian"
        : pickOne(wave.fruitPool === "all" ? FRUIT_TYPES : wave.fruitPool);
    const data = kind === "durian" ? DURIAN : FRUITS[type];
    const launch = createLaunchVector({
      viewport,
      data,
      wave,
      slotIndex,
      slotCount: Math.max(1, this.totalSpawnsThisWave),
    });

    return createEntity({
      kind,
      type,
      x: launch.x,
      y: launch.y,
      vx: launch.vx,
      vy: launch.vy,
      bornAt: performance.now(),
    });
  }
}
