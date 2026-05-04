export class AudioEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.compressor = null;
    this.masterFilter = null;

    this.ambientGain = null;
    this.sliceBus = null;
    this.durianGain = null;
    this.uiGain = null;

    this.noiseBuffer = null;

    this.ambientVoices = [];
    this.ambientLfos = [];
    this.ambientNoiseSource = null;
    this.ambientPluckTimer = null;

    this.durianOscillators = [];
    this.durianNoiseSource = null;
    this.durianFilter = null;

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
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 2.4;
      this.compressor.attack.value = 0.008;
      this.compressor.release.value = 0.28;

      this.master = this.context.createGain();
      this.master.gain.value = 0.88;

      this.masterFilter = this.context.createBiquadFilter();
      this.masterFilter.type = "lowpass";
      this.masterFilter.frequency.value = 8200;
      this.masterFilter.Q.value = 0.14;

      this.ambientGain = this.context.createGain();
      this.ambientGain.gain.value = 0.0001;

      this.sliceBus = this.context.createGain();
      this.sliceBus.gain.value = 0.92;

      this.durianGain = this.context.createGain();
      this.durianGain.gain.value = 0.0001;

      this.uiGain = this.context.createGain();
      this.uiGain.gain.value = 0.72;

      this.ambientGain.connect(this.master);
      this.sliceBus.connect(this.master);
      this.durianGain.connect(this.master);
      this.uiGain.connect(this.master);

      this.master.connect(this.masterFilter);
      this.masterFilter.connect(this.compressor);
      this.compressor.connect(this.context.destination);
    }

    if (!this.noiseBuffer) {
      const noiseLength = Math.round(this.context.sampleRate * 2.6);
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

    /*
      Soft tropical handmade ambience:
      - warm pad underneath
      - filtered surf/air noise
      - occasional quiet kalimba/marimba plucks
      - low durian warning bed stays separate
    */

    const padFrequencies = [82, 123.5, 164.5, 247];
    this.ambientVoices = padFrequencies.map((frequency, index) => {
      const osc = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = index === 1 ? "triangle" : "sine";
      osc.frequency.value = frequency;
      osc.detune.value = [-5, 2, 7, -3][index] ?? 0;

      voiceGain.gain.value = [0.026, 0.017, 0.013, 0.008][index];

      filter.type = "lowpass";
      filter.frequency.value = 620 - index * 65;
      filter.Q.value = 0.28;

      osc.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(this.ambientGain);
      osc.start();

      const lfo = ctx.createOscillator();
      const lfoDepth = ctx.createGain();

      lfo.type = "sine";
      lfo.frequency.value = 0.035 + index * 0.014;
      lfoDepth.gain.value = 0.006 + index * 0.0018;

      lfo.connect(lfoDepth);
      lfoDepth.connect(voiceGain.gain);
      lfo.start();

      this.ambientLfos.push(lfo);

      return { osc, voiceGain, filter };
    });

    // Surf / airy beach-stall bed
    const surfFilter = ctx.createBiquadFilter();
    surfFilter.type = "bandpass";
    surfFilter.frequency.value = 430;
    surfFilter.Q.value = 0.34;

    const surfHighCut = ctx.createBiquadFilter();
    surfHighCut.type = "lowpass";
    surfHighCut.frequency.value = 1400;
    surfHighCut.Q.value = 0.2;

    const surfGain = ctx.createGain();
    surfGain.gain.value = 0.04;

    surfFilter.connect(surfHighCut);
    surfHighCut.connect(surfGain);
    surfGain.connect(this.ambientGain);

    this.ambientNoiseSource = this.createLoopingNoiseSource(surfFilter, 0.11);

    // Occasional quiet tropical plucks
    this.scheduleAmbientPlucks();

    // Durian warning bed
    const durianFundamental = ctx.createOscillator();
    durianFundamental.type = "sine";
    durianFundamental.frequency.value = 74;

    const durianOvertone = ctx.createOscillator();
    durianOvertone.type = "triangle";
    durianOvertone.frequency.value = 151;

    const durianFundamentalGain = ctx.createGain();
    const durianOvertoneGain = ctx.createGain();

    durianFundamentalGain.gain.value = 0.055;
    durianOvertoneGain.gain.value = 0.014;

    this.durianFilter = ctx.createBiquadFilter();
    this.durianFilter.type = "lowpass";
    this.durianFilter.frequency.value = 300;
    this.durianFilter.Q.value = 1.3;

    durianFundamental.connect(durianFundamentalGain);
    durianOvertone.connect(durianOvertoneGain);
    durianFundamentalGain.connect(this.durianFilter);
    durianOvertoneGain.connect(this.durianFilter);

    const durianNoiseFilter = ctx.createBiquadFilter();
    durianNoiseFilter.type = "lowpass";
    durianNoiseFilter.frequency.value = 170;
    durianNoiseFilter.Q.value = 0.9;

    const durianNoiseGain = ctx.createGain();
    durianNoiseGain.gain.value = 0.024;

    durianNoiseFilter.connect(durianNoiseGain);
    durianNoiseGain.connect(this.durianFilter);

    this.durianFilter.connect(this.durianGain);
    this.durianNoiseSource = this.createLoopingNoiseSource(
      durianNoiseFilter,
      0.075
    );

    const durianLfo = ctx.createOscillator();
    const durianLfoDepth = ctx.createGain();

    durianLfo.type = "sine";
    durianLfo.frequency.value = 0.78;
    durianLfoDepth.gain.value = 7;

    durianLfo.connect(durianLfoDepth);
    durianLfoDepth.connect(durianFundamental.frequency);
    durianLfo.start();

    this.ambientLfos.push(durianLfo);

    durianFundamental.start();
    durianOvertone.start();

    this.durianOscillators = [durianFundamental, durianOvertone];
  }

  scheduleAmbientPlucks() {
    const ctx = this.ensureContext();

    if (!ctx || this.ambientPluckTimer) {
      return;
    }

    const playOnePluck = () => {
      if (!this.context || this.muted) {
        this.ambientPluckTimer = window.setTimeout(playOnePluck, 2400);
        return;
      }

      const now = ctx.currentTime;
      const notes = [392, 440, 523.25, 587.33, 659.25];
      const frequency = notes[Math.floor(Math.random() * notes.length)];

      this.playWoodPluck({
        time: now,
        frequency,
        gain: 0.012,
        duration: 0.42,
        destination: this.ambientGain,
        pan: Math.random() * 0.5 - 0.25,
      });

      const nextDelay = 2200 + Math.random() * 3600;
      this.ambientPluckTimer = window.setTimeout(playOnePluck, nextDelay);
    };

    this.ambientPluckTimer = window.setTimeout(playOnePluck, 1800);
  }

  createNoiseBurst({
    time,
    duration,
    gain,
    filterType = "bandpass",
    frequency = 1200,
    q = 0.8,
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
    amp.gain.exponentialRampToValueAtTime(gain, time + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    source.connect(filter);
    filter.connect(amp);
    amp.connect(destination);

    source.start(time);
    source.stop(time + duration + 0.02);
  }

  playWoodPluck({
    time,
    frequency,
    gain = 0.04,
    duration = 0.22,
    destination = this.sliceBus,
    pan = 0,
  }) {
    const ctx = this.ensureContext();

    if (!ctx) {
      return;
    }

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const amp = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, time);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(80, frequency * 0.86),
      time + duration
    );

    filter.type = "bandpass";
    filter.frequency.value = frequency * 1.7;
    filter.Q.value = 2.2;

    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(gain, time + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(amp);

    if (ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      amp.connect(panner);
      panner.connect(destination);
    } else {
      amp.connect(destination);
    }

    osc.start(time);
    osc.stop(time + duration + 0.03);
  }

  playJuicyPop(time, intensity, destination = this.sliceBus) {
    const ctx = this.ensureContext();

    if (!ctx) {
      return;
    }

    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    const popFilter = ctx.createBiquadFilter();

    pop.type = "sine";
    pop.frequency.setValueAtTime(190 + intensity * 55, time);
    pop.frequency.exponentialRampToValueAtTime(92, time + 0.07);

    popFilter.type = "lowpass";
    popFilter.frequency.value = 900;
    popFilter.Q.value = 0.4;

    popGain.gain.setValueAtTime(0.0001, time);
    popGain.gain.exponentialRampToValueAtTime(
      0.055 + intensity * 0.018,
      time + 0.008
    );
    popGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);

    pop.connect(popFilter);
    popFilter.connect(popGain);
    popGain.connect(destination);

    pop.start(time);
    pop.stop(time + 0.11);
  }

  playSlice(intensity = 1) {
    const ctx = this.ensureContext();

    if (!ctx || this.muted) {
      return;
    }

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    this.ensureAmbient();

    const now = ctx.currentTime;
    const clampedIntensity = Math.min(1.4, Math.max(0.7, intensity));

    // Airy blade swipe
    this.createNoiseBurst({
      time: now,
      duration: 0.15,
      gain: 0.12 + clampedIntensity * 0.045,
      filterType: "bandpass",
      frequency: 980 + clampedIntensity * 700,
      q: 0.72,
      destination: this.sliceBus,
    });

    // Brighter edge of the swipe
    this.createNoiseBurst({
      time: now + 0.012,
      duration: 0.09,
      gain: 0.045 + clampedIntensity * 0.018,
      filterType: "highpass",
      frequency: 2200 + clampedIntensity * 800,
      q: 0.5,
      destination: this.sliceBus,
    });

    // Juicy pop
    this.playJuicyPop(now + 0.018, clampedIntensity, this.sliceBus);

    // Tropical wooden/marimba note
    const noteSet = [392, 440, 523.25, 587.33, 659.25];
    const noteIndex = Math.min(
      noteSet.length - 1,
      Math.floor((clampedIntensity - 0.7) * 3.4)
    );

    this.playWoodPluck({
      time: now + 0.026,
      frequency: noteSet[noteIndex],
      gain: 0.034 + clampedIntensity * 0.016,
      duration: 0.24,
      destination: this.sliceBus,
      pan: Math.random() * 0.24 - 0.12,
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

    this.ensureAmbient();

    const now = ctx.currentTime;
    const clampedIntensity = Math.min(1.4, Math.max(0.7, intensity));

    // Crunchy spiky burst
    this.createNoiseBurst({
      time: now,
      duration: 0.18,
      gain: 0.16 + clampedIntensity * 0.055,
      filterType: "bandpass",
      frequency: 520 + clampedIntensity * 260,
      q: 2.2,
      destination: this.sliceBus,
    });

    // Low wooden thonk
    const thonk = ctx.createOscillator();
    const thonkGain = ctx.createGain();
    const thonkFilter = ctx.createBiquadFilter();

    thonk.type = "triangle";
    thonk.frequency.setValueAtTime(145 + clampedIntensity * 20, now);
    thonk.frequency.exponentialRampToValueAtTime(58, now + 0.16);

    thonkFilter.type = "lowpass";
    thonkFilter.frequency.value = 560;
    thonkFilter.Q.value = 0.9;

    thonkGain.gain.setValueAtTime(0.0001, now);
    thonkGain.gain.exponentialRampToValueAtTime(0.12, now + 0.012);
    thonkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    thonk.connect(thonkFilter);
    thonkFilter.connect(thonkGain);
    thonkGain.connect(this.sliceBus);

    thonk.start(now);
    thonk.stop(now + 0.24);

    // Sour wobble, instantly different from normal fruit
    const wobble = ctx.createOscillator();
    const wobbleLfo = ctx.createOscillator();
    const wobbleLfoDepth = ctx.createGain();
    const wobbleGain = ctx.createGain();
    const wobbleFilter = ctx.createBiquadFilter();

    wobble.type = "sawtooth";
    wobble.frequency.value = 92;

    wobbleLfo.type = "sine";
    wobbleLfo.frequency.value = 18;
    wobbleLfoDepth.gain.value = 18;

    wobbleLfo.connect(wobbleLfoDepth);
    wobbleLfoDepth.connect(wobble.frequency);

    wobbleFilter.type = "lowpass";
    wobbleFilter.frequency.value = 420;
    wobbleFilter.Q.value = 1.2;

    wobbleGain.gain.setValueAtTime(0.0001, now);
    wobbleGain.gain.exponentialRampToValueAtTime(0.045, now + 0.018);
    wobbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    wobble.connect(wobbleFilter);
    wobbleFilter.connect(wobbleGain);
    wobbleGain.connect(this.sliceBus);

    wobble.start(now);
    wobbleLfo.start(now);
    wobble.stop(now + 0.34);
    wobbleLfo.stop(now + 0.34);
  }

  playButtonTap() {
    const ctx = this.ensureContext();

    if (!ctx || this.muted) {
      return;
    }

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    this.playWoodPluck({
      time: now,
      frequency: 440,
      gain: 0.028,
      duration: 0.16,
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
    const notes = [392, 523.25, 659.25];

    notes.forEach((frequency, index) => {
      this.playWoodPluck({
        time: now + index * 0.055,
        frequency,
        gain: 0.032 - index * 0.004,
        duration: 0.22,
        destination: this.uiGain,
        pan: (index - 1) * 0.08,
      });
    });
  }

  setAmbientTarget(level) {
    const ctx = this.ensureContext();

    if (!ctx) {
      return;
    }

    this.ensureAmbient();

    const now = ctx.currentTime;
    this.ambientTarget = Math.max(0.0001, level);
    const nextLevel = this.muted ? 0.0001 : this.ambientTarget;

    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
    this.ambientGain.gain.linearRampToValueAtTime(nextLevel, now + 0.42);

    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(
      this.muted ? 0.0001 : Math.min(0.9, 0.74 + nextLevel * 0.85),
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
    this.durianWarningActive = active;
    const warningLevel = !this.muted && active;

    this.durianGain.gain.cancelScheduledValues(now);
    this.durianGain.gain.setValueAtTime(this.durianGain.gain.value, now);
    this.durianGain.gain.linearRampToValueAtTime(
      warningLevel ? 0.052 : 0.0001,
      now + (warningLevel ? 0.12 : 0.2)
    );

    if (this.durianFilter) {
      this.durianFilter.frequency.cancelScheduledValues(now);
      this.durianFilter.frequency.setValueAtTime(
        this.durianFilter.frequency.value,
        now
      );
      this.durianFilter.frequency.linearRampToValueAtTime(
        warningLevel ? 440 : 300,
        now + 0.18
      );
    }
  }

  setMuted(muted) {
    this.muted = muted;
    this.setAmbientTarget(this.ambientTarget);
    this.setDurianWarning(this.durianWarningActive);
  }
}