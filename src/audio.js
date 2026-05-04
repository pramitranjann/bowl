export class AudioEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.compressor = null;
    this.masterFilter = null;
    this.sliceBus = null;
    this.uiGain = null;
    this.noiseBuffer = null;
    this.muted = false;
    this.ambientTarget = 0.0001;
    this.durianWarningActive = false;
  }

  ensureContext() {
    if (!this.context) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextCtor) {
        return null;
      }

      this.context = new AudioContextCtor();

      this.compressor = this.context.createDynamicsCompressor();
      this.compressor.threshold.value = -18;
      this.compressor.knee.value = 16;
      this.compressor.ratio.value = 2.1;
      this.compressor.attack.value = 0.006;
      this.compressor.release.value = 0.24;

      this.master = this.context.createGain();
      this.master.gain.value = 0.82;

      this.masterFilter = this.context.createBiquadFilter();
      this.masterFilter.type = "lowpass";
      this.masterFilter.frequency.value = 7200;
      this.masterFilter.Q.value = 0.1;

      this.sliceBus = this.context.createGain();
      this.sliceBus.gain.value = 0.9;

      this.uiGain = this.context.createGain();
      this.uiGain.gain.value = 0.64;

      this.sliceBus.connect(this.master);
      this.uiGain.connect(this.master);
      this.master.connect(this.masterFilter);
      this.masterFilter.connect(this.compressor);
      this.compressor.connect(this.context.destination);
    }

    if (!this.noiseBuffer) {
      const noiseLength = Math.round(this.context.sampleRate * 0.6);
      const buffer = this.context.createBuffer(
        1,
        noiseLength,
        this.context.sampleRate
      );
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
  }

  createNoiseBurst({
    time,
    duration,
    gain,
    filterType = "bandpass",
    frequency = 900,
    q = 0.9,
    destination = this.sliceBus,
  }) {
    const ctx = this.ensureContext();

    if (!ctx || !this.noiseBuffer) {
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(gain, time + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    source.connect(filter);
    filter.connect(amp);
    amp.connect(destination);

    source.start(time);
    source.stop(time + duration + 0.02);
  }

  playBowlKnock({
    time,
    gain = 0.06,
    pitch = 132,
    destination = this.sliceBus,
  }) {
    const ctx = this.ensureContext();

    if (!ctx) {
      return;
    }

    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(48, pitch * 0.52), time + 0.11);

    filter.type = "lowpass";
    filter.frequency.value = 430;
    filter.Q.value = 1.35;

    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(gain, time + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(destination);

    osc.start(time);
    osc.stop(time + 0.16);
  }

  playSmallWoodTick({
    time,
    frequency = 440,
    gain = 0.028,
    duration = 0.15,
    destination = this.sliceBus,
  }) {
    const ctx = this.ensureContext();

    if (!ctx) {
      return;
    }

    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, time);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.82, time + duration);

    filter.type = "bandpass";
    filter.frequency.value = frequency * 2.2;
    filter.Q.value = 2.7;

    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(gain, time + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(destination);

    osc.start(time);
    osc.stop(time + duration + 0.03);
  }

  playSoftFruitDrop(time, intensity = 1) {
    const ctx = this.ensureContext();

    if (!ctx) {
      return;
    }

    const pop = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    pop.type = "sine";
    pop.frequency.setValueAtTime(145 + intensity * 28, time);
    pop.frequency.exponentialRampToValueAtTime(72, time + 0.075);

    filter.type = "lowpass";
    filter.frequency.value = 760;
    filter.Q.value = 0.45;

    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(0.032 + intensity * 0.009, time + 0.007);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.095);

    pop.connect(filter);
    filter.connect(amp);
    amp.connect(this.sliceBus);

    pop.start(time);
    pop.stop(time + 0.12);
  }

  playSlice(intensity = 1) {
    const ctx = this.ensureContext();

    if (!ctx || this.muted) {
      return;
    }

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const clampedIntensity = Math.min(1.4, Math.max(0.7, intensity));

    // Very short soft slice, not arcade whoosh.
    this.createNoiseBurst({
      time: now,
      duration: 0.055,
      gain: 0.022 + clampedIntensity * 0.008,
      filterType: "bandpass",
      frequency: 720 + clampedIntensity * 230,
      q: 0.9,
      destination: this.sliceBus,
    });

    // Fruit landing into the bowl.
    this.playSoftFruitDrop(now + 0.012, clampedIntensity);

    // Hollow coconut bowl knock.
    this.playBowlKnock({
      time: now + 0.024,
      gain: 0.07 + clampedIntensity * 0.022,
      pitch: 128 + clampedIntensity * 14,
      destination: this.sliceBus,
    });

    // Tiny handmade tick as a light accent.
    const notes = [392, 440, 493.88, 523.25];
    const note = notes[Math.floor(Math.random() * notes.length)];

    this.playSmallWoodTick({
      time: now + 0.046,
      frequency: note,
      gain: 0.018 + clampedIntensity * 0.008,
      duration: 0.13,
      destination: this.sliceBus,
    });
  }

  playDurianHit(intensity = 1) {
    const ctx = this.ensureContext();

    if (!ctx || this.muted) {
      return;
    }

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const clampedIntensity = Math.min(1.4, Math.max(0.7, intensity));

    // Dry spiky crack.
    this.createNoiseBurst({
      time: now,
      duration: 0.11,
      gain: 0.095 + clampedIntensity * 0.032,
      filterType: "bandpass",
      frequency: 520 + clampedIntensity * 210,
      q: 2.1,
      destination: this.sliceBus,
    });

    // Heavier bad bowl thud.
    this.playBowlKnock({
      time: now + 0.01,
      gain: 0.13,
      pitch: 96,
      destination: this.sliceBus,
    });

    // Sour low wobble, short and distinct.
    const wobble = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    wobble.type = "sawtooth";
    wobble.frequency.setValueAtTime(94, now);
    wobble.frequency.exponentialRampToValueAtTime(54, now + 0.22);

    filter.type = "lowpass";
    filter.frequency.value = 360;
    filter.Q.value = 1.05;

    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(0.038, now + 0.014);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    wobble.connect(filter);
    filter.connect(amp);
    amp.connect(this.sliceBus);

    wobble.start(now);
    wobble.stop(now + 0.26);
  }

  playButtonTap() {
    const ctx = this.ensureContext();

    if (!ctx || this.muted) {
      return;
    }

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    this.playSmallWoodTick({
      time: ctx.currentTime,
      frequency: 440,
      gain: 0.024,
      duration: 0.12,
      destination: this.uiGain,
    });
  }

  playModeConfirm() {
    const ctx = this.ensureContext();

    if (!ctx || this.muted) {
      return;
    }

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    [392, 523.25, 659.25].forEach((frequency, index) => {
      this.playSmallWoodTick({
        time: now + index * 0.055,
        frequency,
        gain: 0.024 - index * 0.003,
        duration: 0.13,
        destination: this.uiGain,
      });
    });
  }

  setAmbientTarget(level) {
    // Intentionally no background ambience.
    // Keep the method so main.js can call it safely.
    this.ambientTarget = Math.max(0.0001, level);
  }

  setDurianWarning(active) {
    // Intentionally no constant warning bed.
    // Durian feedback happens only on hit via playDurianHit().
    this.durianWarningActive = active;
  }

  setMuted(muted) {
    this.muted = muted;
  }
}