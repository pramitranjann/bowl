import { CONFIG } from "./config.js";
import { MODES } from "./states.js";

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export class EnvironmentSystem {
  constructor(videoElement) {
    this.video = videoElement;
    this.viewport = { width: window.innerWidth, height: window.innerHeight };
    this.birds = [];
    this.fireflies = [];
    this.lastPlaybackAttemptAt = 0;
    this.lastVideoTime = 0;
    this.lastVideoAdvanceAt = 0;
    this.nextBirdAt =
      performance.now() +
      randomBetween(CONFIG.birdSpawnMinMs, CONFIG.birdSpawnMaxMs);
    this.fireflyAccumulator = 0;
  }

  async start() {
    const src = "./assets/environment/beach.mp4";
    this.video.autoplay = true;
    this.video.muted = true;
    this.video.defaultMuted = true;
    this.video.loop = true;
    this.video.playsInline = true;
    this.video.disableRemotePlayback = true;
    this.video.preload = "auto";
    this.video.setAttribute("autoplay", "");
    this.video.setAttribute("muted", "");
    this.video.setAttribute("loop", "");
    this.video.setAttribute("playsinline", "");
    this.video.setAttribute("webkit-playsinline", "");
    this.video.src = src;
    this.video.addEventListener("loadeddata", () => {
      this.requestPlayback(true);
    });
    this.video.addEventListener("canplay", () => {
      this.requestPlayback(true);
    });
    this.video.addEventListener("pause", () => {
      if (!this.video.ended) {
        this.requestPlayback();
      }
    });
    this.video.addEventListener("stalled", () => {
      this.requestPlayback(true);
    });
    this.video.addEventListener("waiting", () => {
      this.requestPlayback();
    });
    this.video.load();
    this.video.addEventListener("ended", () => {
      this.video.currentTime = 0;
      this.requestPlayback(true);
    });
    try {
      await this.ensurePlayback(true);
    } catch {
      // Placeholder gradient fallback when no environment asset exists.
    }
  }

  async ensurePlayback(force = false) {
    const nowMs = performance.now();
    if (
      !force &&
      (!this.video.paused || nowMs - this.lastPlaybackAttemptAt < 1000)
    ) {
      return;
    }
    this.lastPlaybackAttemptAt = nowMs;
    await this.video.play();
  }

  requestPlayback(force = false) {
    void this.ensurePlayback(force).catch(() => {
      // Ignore playback retries that browsers reject outside a direct gesture.
    });
  }

  reset(nowMs) {
    this.birds = [];
    this.fireflies = [];
    this.lastVideoAdvanceAt = nowMs;
    this.lastVideoTime = this.video.currentTime || 0;
    this.nextBirdAt =
      nowMs + randomBetween(CONFIG.birdSpawnMinMs, CONFIG.birdSpawnMaxMs);
    this.fireflyAccumulator = 0;
  }

  resize(viewport) {
    this.viewport = { width: viewport.width, height: viewport.height };
  }

  hasRenderableVideo(nowMs = performance.now()) {
    return (
      this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      nowMs - this.lastVideoAdvanceAt <= CONFIG.environmentPlaybackStallMs
    );
  }

  setVisible(visible) {
    this.video.style.opacity = visible ? "1" : "0";
  }

  update(nowMs, dtSeconds, { idle, mode, sunsetProgress, liteMode }) {
    if (
      this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      Math.abs(this.video.currentTime - this.lastVideoTime) >=
        CONFIG.environmentPlaybackEpsilon
    ) {
      this.lastVideoTime = this.video.currentTime;
      this.lastVideoAdvanceAt = nowMs;
    }

    if (!liteMode && nowMs >= this.nextBirdAt) {
      this.spawnBird(nowMs);
      this.nextBirdAt =
        nowMs + randomBetween(CONFIG.birdSpawnMinMs, CONFIG.birdSpawnMaxMs);
    }

    this.birds = this.birds
      .map((bird) => ({
        ...bird,
        x: bird.x + bird.vx * dtSeconds,
      }))
      .filter((bird) => bird.x > -240 && bird.x < this.viewport.width + 240);

    if (idle) {
      this.fireflyAccumulator += dtSeconds * CONFIG.idleFireflySpawnRate;
      while (this.fireflyAccumulator >= 1) {
        this.fireflyAccumulator -= 1;
        if (this.fireflies.length < 3) {
          this.fireflies.push(this.createFirefly());
        }
      }
    } else {
      this.fireflies = this.fireflies.filter((firefly) => firefly.alpha > 0.08);
    }

    this.fireflies = this.fireflies
      .map((firefly) => ({
        ...firefly,
        x: firefly.x + firefly.vx * dtSeconds,
        y: firefly.y + Math.sin(nowMs * 0.002 + firefly.seed) * 0.18,
        alpha: idle ? Math.min(1, firefly.alpha + dtSeconds) : Math.max(0, firefly.alpha - dtSeconds),
      }))
      .filter((firefly) => firefly.alpha > 0);

    this.mode = mode;
    this.sunsetProgress = sunsetProgress;
  }

  spawnBird() {
    const fromLeft = Math.random() > 0.5;
    this.birds.push({
      x: fromLeft ? -80 : this.viewport.width + 80,
      y: randomBetween(60, 180),
      vx: (fromLeft ? 1 : -1) * randomBetween(28, 42),
      size: randomBetween(16, 26),
    });
  }

  createFirefly() {
    return {
      x: randomBetween(100, this.viewport.width - 100),
      y: randomBetween(this.viewport.height * 0.2, this.viewport.height * 0.8),
      vx: randomBetween(-12, 12),
      alpha: 0,
      seed: Math.random() * Math.PI * 2,
    };
  }

  renderBackground(ctx, viewport) {
    if (this.video.src && this.video.paused && !this.video.ended) {
      this.requestPlayback();
    }
    if (!this.hasRenderableVideo()) {
      this.requestPlayback();
    }
    if (this.hasRenderableVideo()) {
      ctx.drawImage(this.video, 0, 0, viewport.width, viewport.height);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, viewport.height);
      if (this.mode === MODES.SUNSET) {
        const dusk = this.sunsetProgress ?? 0;
        gradient.addColorStop(0, `rgba(${Math.round(55 + dusk * 95)}, ${Math.round(126 - dusk * 40)}, ${Math.round(176 - dusk * 60)}, 1)`);
        gradient.addColorStop(1, `rgba(${Math.round(232)}, ${Math.round(181 - dusk * 40)}, ${Math.round(121 - dusk * 35)}, 1)`);
      } else {
        gradient.addColorStop(0, "#6bb8d6");
        gradient.addColorStop(0.58, "#9ec98d");
        gradient.addColorStop(1, "#d6c08e");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, viewport.width, viewport.height);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      for (let i = 0; i < 6; i += 1) {
        ctx.beginPath();
        ctx.arc(
          viewport.width * (0.16 + i * 0.17),
          viewport.height * (0.32 + (i % 2) * 0.03),
          90 + i * 10,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  renderAmbient(ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(39, 41, 38, 0.45)";
    for (const bird of this.birds) {
      ctx.beginPath();
      ctx.moveTo(bird.x, bird.y);
      ctx.lineTo(bird.x - bird.size, bird.y + bird.size * 0.35);
      ctx.lineTo(bird.x - bird.size, bird.y - bird.size * 0.35);
      ctx.closePath();
      ctx.fill();
    }

    for (const firefly of this.fireflies) {
      ctx.globalAlpha = firefly.alpha * 0.9;
      ctx.fillStyle = "#f6f0a8";
      ctx.beginPath();
      ctx.arc(firefly.x, firefly.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
