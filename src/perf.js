import { CONFIG } from "./config.js";

export class PerformanceMonitor {
  constructor() {
    this.samples = [];
    this.liteMode = false;
  }

  update(nowMs, dtSeconds) {
    this.samples.push({ nowMs, fps: 1 / Math.max(dtSeconds, 0.0001) });
    const cutoff = nowMs - CONFIG.liteWindowMs;
    this.samples = this.samples.filter((sample) => sample.nowMs >= cutoff);
    const averageFps =
      this.samples.reduce((sum, sample) => sum + sample.fps, 0) /
      Math.max(1, this.samples.length);
    this.liteMode = averageFps < CONFIG.liteFpsThreshold;
    return {
      averageFps,
      liteMode: this.liteMode,
    };
  }
}
