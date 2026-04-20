export class AudioEngine {
  constructor() {
    this.context = null;
    this.noiseBuffer = null;
    this.master = null;
    this.ambientGain = null;
    this.durianGain = null;
    this.ambientOscillators = [];
    this.durianOscillator = null;
  }

  ensureContext() {
    if (!this.context) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) {
        return null;
      }
      this.context = new AudioContextCtor();
      this.master = this.context.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.context.destination);
      this.ambientGain = this.context.createGain();
      this.ambientGain.gain.value = 0.0001;
      this.ambientGain.connect(this.master);
      this.durianGain = this.context.createGain();
      this.durianGain.gain.value = 0.0001;
      this.durianGain.connect(this.master);
    }

    if (!this.noiseBuffer) {
      const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.12, this.context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < channel.length; i += 1) {
        channel[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }

    return this.context;
  }

  unlock() {
    const ctx = this.ensureContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    this.ensureAmbient();
  }

  ensureAmbient() {
    const ctx = this.ensureContext();
    if (!ctx || this.ambientOscillators.length) {
      return;
    }

    const frequencies = [82, 124, 166];
    this.ambientOscillators = frequencies.map((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.value = 0.02 / (index + 1);
      osc.connect(gain);
      gain.connect(this.ambientGain);
      osc.start();
      return { osc, gain };
    });

    this.durianOscillator = ctx.createOscillator();
    this.durianOscillator.type = "sine";
    this.durianOscillator.frequency.value = 80;
    this.durianOscillator.connect(this.durianGain);
    this.durianOscillator.start();
  }

  playSlice(intensity = 1) {
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200 + intensity * 1200;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18 + intensity * 0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.12);
  }

  setAmbientTarget(level) {
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }
    this.ensureAmbient();
    this.ambientGain.gain.linearRampToValueAtTime(level, ctx.currentTime + 0.3);
  }

  setDurianWarning(active) {
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }
    this.ensureAmbient();
    this.durianGain.gain.linearRampToValueAtTime(
      active ? 0.05 : 0.0001,
      ctx.currentTime + 0.08
    );
  }
}
