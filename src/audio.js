export class AudioEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.compressor = null;
    this.masterFilter = null;
    this.ambientGain = null;
    this.sliceBus = null;
    this.durianGain = null;
    this.noiseBuffer = null;

    this.ambientVoices = [];
    this.ambientLfos = [];
    this.ambientNoiseSource = null;
    this.durianOscillators = [];
    this.durianNoiseSource = null;
    this.durianFilter = null;
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
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 2.2;
      this.compressor.attack.value = 0.01;
      this.compressor.release.value = 0.28;

      this.master = this.context.createGain();
      this.master.gain.value = 0.82;

      this.masterFilter = this.context.createBiquadFilter();
      this.masterFilter.type = "lowpass";
      this.masterFilter.frequency.value = 7600;
      this.masterFilter.Q.value = 0.12;

      this.ambientGain = this.context.createGain();
      this.ambientGain.gain.value = 0.0001;

      this.sliceBus = this.context.createGain();
      this.sliceBus.gain.value = 0.92;

      this.durianGain = this.context.createGain();
      this.durianGain.gain.value = 0.0001;

      this.ambientGain.connect(this.master);
      this.sliceBus.connect(this.master);
      this.durianGain.connect(this.master);
      this.master.connect(this.masterFilter);
      this.masterFilter.connect(this.compressor);
      this.compressor.connect(this.context.destination);
    }

    if (!this.noiseBuffer) {
      const noiseLength = Math.round(this.context.sampleRate * 2.4);
      const buffer = this.context.createBuffer(1, noiseLength, this.context.sampleRate);
      const channel = buffer.getChannelData(0);

      for (let i = 0; i < channel.length; i += 1) {
        channel[i] = Math.random() * 2 - 1;
      }

      this.noiseBuffer = buffer;
    }

    return this.context;
  }

  createLoopingNoiseSource(targetNode, playbackRate = 1) {
    const ctx = this.ensureContext();
    if (!ctx || !this.noiseBuffer) {
      return null;
    }

    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;
    source.playbackRate.value = playbackRate;
    source.connect(targetNode);
    source.start();
    return source;
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
    if (!ctx || this.ambientVoices.length) {
      return;
    }

    const padFrequencies = [82, 123.5, 164.5];
    this.ambientVoices = padFrequencies.map((frequency, index) => {
      const osc = ctx.createOscillator();
      const toneShape = ctx.createGain();
      const voiceGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = index === 1 ? "triangle" : "sine";
      osc.frequency.value = frequency;
      osc.detune.value = index === 2 ? 6 : index === 0 ? -4 : 0;

      toneShape.gain.value = index === 1 ? 0.22 : 1;
      voiceGain.gain.value = [0.021, 0.011, 0.008][index];

      filter.type = "lowpass";
      filter.frequency.value = 720 - index * 120;
      filter.Q.value = 0.3;

      osc.connect(toneShape);
      toneShape.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(this.ambientGain);
      osc.start();

      const lfo = ctx.createOscillator();
      const lfoDepth = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.value = 0.045 + index * 0.018;
      lfoDepth.gain.value = 0.004 + index * 0.0016;
      lfo.connect(lfoDepth);
      lfoDepth.connect(voiceGain.gain);
      lfo.start();
      this.ambientLfos.push(lfo);

      return { osc, voiceGain, filter };
    });

    const surfFilter = ctx.createBiquadFilter();
    surfFilter.type = "bandpass";
    surfFilter.frequency.value = 520;
    surfFilter.Q.value = 0.4;

    const surfGain = ctx.createGain();
    surfGain.gain.value = 0.013;
    surfFilter.connect(surfGain);
    surfGain.connect(this.ambientGain);

    this.ambientNoiseSource = this.createLoopingNoiseSource(surfFilter, 0.13);

    const durianFundamental = ctx.createOscillator();
    durianFundamental.type = "sine";
    durianFundamental.frequency.value = 80;

    const durianOvertone = ctx.createOscillator();
    durianOvertone.type = "triangle";
    durianOvertone.frequency.value = 161;

    const durianFundamentalGain = ctx.createGain();
    const durianOvertoneGain = ctx.createGain();
    durianFundamentalGain.gain.value = 0.055;
    durianOvertoneGain.gain.value = 0.012;

    this.durianFilter = ctx.createBiquadFilter();
    this.durianFilter.type = "lowpass";
    this.durianFilter.frequency.value = 320;
    this.durianFilter.Q.value = 1.2;

    durianFundamental.connect(durianFundamentalGain);
    durianOvertone.connect(durianOvertoneGain);
    durianFundamentalGain.connect(this.durianFilter);
    durianOvertoneGain.connect(this.durianFilter);

    const durianNoiseFilter = ctx.createBiquadFilter();
    durianNoiseFilter.type = "lowpass";
    durianNoiseFilter.frequency.value = 180;
    durianNoiseFilter.Q.value = 0.8;

    const durianNoiseGain = ctx.createGain();
    durianNoiseGain.gain.value = 0.02;
    durianNoiseFilter.connect(durianNoiseGain);
    durianNoiseGain.connect(this.durianFilter);

    this.durianFilter.connect(this.durianGain);
    this.durianNoiseSource = this.createLoopingNoiseSource(durianNoiseFilter, 0.085);

    const durianLfo = ctx.createOscillator();
    const durianLfoDepth = ctx.createGain();
    durianLfo.type = "sine";
    durianLfo.frequency.value = 0.8;
    durianLfoDepth.gain.value = 6;
    durianLfo.connect(durianLfoDepth);
    durianLfoDepth.connect(durianFundamental.frequency);
    durianLfo.start();
    this.ambientLfos.push(durianLfo);

    durianFundamental.start();
    durianOvertone.start();
    this.durianOscillators = [durianFundamental, durianOvertone];
  }

  playSlice(intensity = 1) {
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    this.ensureAmbient();

    const now = ctx.currentTime;
    const clampedIntensity = Math.min(1.4, Math.max(0.7, intensity));

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;

    const whooshFilter = ctx.createBiquadFilter();
    whooshFilter.type = "bandpass";
    whooshFilter.frequency.setValueAtTime(900 + clampedIntensity * 380, now);
    whooshFilter.frequency.exponentialRampToValueAtTime(
      2200 + clampedIntensity * 900,
      now + 0.045
    );
    whooshFilter.Q.value = 0.85;

    const highPass = ctx.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = 280;

    const whooshGain = ctx.createGain();
    whooshGain.gain.setValueAtTime(0.0001, now);
    whooshGain.gain.exponentialRampToValueAtTime(
      0.14 + clampedIntensity * 0.05,
      now + 0.01
    );
    whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    noiseSource.connect(highPass);
    highPass.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(this.sliceBus);

    const tone = ctx.createOscillator();
    tone.type = "triangle";
    tone.frequency.setValueAtTime(540 + clampedIntensity * 140, now);
    tone.frequency.exponentialRampToValueAtTime(220, now + 0.12);

    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0.0001, now);
    toneGain.gain.exponentialRampToValueAtTime(0.035, now + 0.01);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = "lowpass";
    toneFilter.frequency.value = 1200;

    tone.connect(toneFilter);
    toneFilter.connect(toneGain);
    toneGain.connect(this.sliceBus);

    noiseSource.start(now);
    noiseSource.stop(now + 0.18);
    tone.start(now);
    tone.stop(now + 0.14);
  }

  setAmbientTarget(level) {
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    this.ensureAmbient();
    const now = ctx.currentTime;
    const nextLevel = Math.max(0.0001, level);

    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
    this.ambientGain.gain.linearRampToValueAtTime(nextLevel, now + 0.42);

    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(
      Math.min(0.9, 0.78 + nextLevel * 0.7),
      now + 0.42
    );
  }

  setDurianWarning(active) {
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    this.ensureAmbient();
    const now = ctx.currentTime;

    this.durianGain.gain.cancelScheduledValues(now);
    this.durianGain.gain.setValueAtTime(this.durianGain.gain.value, now);
    this.durianGain.gain.linearRampToValueAtTime(
      active ? 0.05 : 0.0001,
      now + (active ? 0.12 : 0.2)
    );

    if (this.durianFilter) {
      this.durianFilter.frequency.cancelScheduledValues(now);
      this.durianFilter.frequency.setValueAtTime(this.durianFilter.frequency.value, now);
      this.durianFilter.frequency.linearRampToValueAtTime(
        active ? 420 : 320,
        now + 0.18
      );
    }
  }
}
