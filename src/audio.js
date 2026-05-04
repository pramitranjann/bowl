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
    this.rhythmTimer = null;
    this.rhythmStep = 0;

    this.durianOscillators = [];
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
      this.compressor.ratio.value = 2.2;
      this.compressor.attack.value = 0.008;
      this.compressor.release.value = 0.26;

      this.master = this.context.createGain();
      this.master.gain.value = 0.84;

      this.masterFilter = this.context.createBiquadFilter();
      this.masterFilter.type = "lowpass";
      this.masterFilter.frequency.value = 8400;
      this.masterFilter.Q.value = 0.12;

      this.ambientGain = this.context.createGain();
      this.ambientGain.gain.value = 0.0001;

      this.sliceBus = this.context.createGain();
      this.sliceBus.gain.value = 0.94;

      this.durianGain = this.context.createGain();
      this.durianGain.gain.value = 0.0001;

      this.uiGain = this.context.createGain();
      this.uiGain.gain.value = 0.74;

      this.ambientGain.connect(this.master);
      this.sliceBus.connect(this.master);
      this.durianGain.connect(this.master);
      this.uiGain.connect(this.master);

      this.master.connect(this.masterFilter);
      this.masterFilter.connect(this.compressor);
      this.compressor.connect(this.context.destination);
    }

    if (!this.noiseBuffer) {
      const noiseLength = Math.round(this.context.sampleRate * 1.2);
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

    this.ensureAmbient();
  }

  ensureAmbient() {
    const ctx = this.ensureContext();

    if (!ctx || this.ambientVoices.length) {
      return;
    }

    /*
      Tropical toy percussion direction:
      - no constant air / surf / fan layer
      - very quiet warm base tone
      - rhythmic coconut / marimba ticks
      - durian warning is a separate low wobble
    */

    const padFrequencies = [82, 123.5, 164.5];

    this.ambientVoices = padFrequencies.map((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = index === 1 ? "triangle" : "sine";
      osc.frequency.value = frequency;
      osc.detune.value = [-4, 2, 6][index] ?? 0;

      gain.gain.value = [0.012, 0.008, 0.005][index];

      filter.type = "lowpass";
      filter.frequency.value = 520 - index * 80;
      filter.Q.value = 0.22;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start();

      const lfo = ctx.createOscillator();
      const lfoDepth = ctx.createGain();

      lfo.type = "sine";
      lfo.frequency.value = 0.035 + index * 0.012;
      lfoDepth.gain.value = 0.0035 + index * 0.001;

      lfo.connect(lfoDepth);
      lfoDepth.connect(gain.gain);
      lfo.start();

      this.ambientLfos.push(lfo);

      return { osc, gain, filter };
    });

    this.setupDurianWarningBed();
    this.scheduleTropicalRhythm();
  }

  setupDurianWarningBed() {
    const ctx = this.ensureContext();

    if (!ctx || this.durianOscillators.length) {
      return;
    }

    const low = ctx.createOscillator();
    const overtone = ctx.createOscillator();

    low.type = "sine";
    low.frequency.value = 74;

    overtone.type = "triangle";
    overtone.frequency.value = 151;

    const lowGain = ctx.createGain();
    const overtoneGain = ctx.createGain();

    lowGain.gain.value = 0.052;
    overtoneGain.gain.value = 0.012;

    this.durianFilter = ctx.createBiquadFilter();
    this.durianFilter.type = "lowpass";
    this.durianFilter.frequency.value = 300;
    this.durianFilter.Q.value = 1.25;

    low.connect(lowGain);
    overtone.connect(overtoneGain);

    lowGain.connect(this.durianFilter);
    overtoneGain.connect(this.durianFilter);

    this.durianFilter.connect(this.durianGain);

    const wobble = ctx.createOscillator();
    const wobbleDepth = ctx.createGain();

    wobble.type = "sine";
    wobble.frequency.value = 0.8;
    wobbleDepth.gain.value = 7;

    wobble.connect(wobbleDepth);
    wobbleDepth.connect(low.frequency);

    low.start();
    overtone.start();
    wobble.start();

    this.durianOscillators = [low, overtone, wobble];
  }

  scheduleTropicalRhythm() {
    const ctx = this.ensureContext();

    if (!ctx || this.rhythmTimer) {
      return;
    }

const pattern = [
  { delay: 0, note: 330, gain: 0.026, kind: "bowl" },
  { delay: 380, note: 392, gain: 0.014, kind: "tick" },
  { delay: 760, note: 330, gain: 0.02, kind: "bowl" },
];

    const playPattern = () => {
      if (!this.context) {
        this.rhythmTimer = window.setTimeout(playPattern, 900);
        return;
      }

      const active = !this.muted && this.ambientTarget > 0.004;

      if (active) {
        const now = ctx.currentTime;
        const rhythmScale = Math.min(1.25, Math.max(0.7, this.ambientTarget * 10));

        pattern.forEach((step, index) => {
          const time = now + step.delay / 1000;
          const pan = [-0.18, 0.1, -0.06, 0.16][index] ?? 0;

          this.playWoodPluck({
            time,
            frequency: step.note,
            gain: step.gain * rhythmScale,
            duration: step.kind === "low" ? 0.2 : 0.16,
            destination: this.ambientGain,
            pan,
          });

          if (step.kind === "bowl") {
  this.playCoconutKnock({
    time,
    gain: 0.032 * rhythmScale,
    destination: this.ambientGain,
  });
} else {
  this.playWoodPluck({
    time,
    frequency: step.note,
    gain: step.gain * rhythmScale,
    duration: 0.13,
    destination: this.ambientGain,
    pan,
  });
}
        });
      }

      const nextDelay = 1150 + Math.random() * 260;
      this.rhythmTimer = window.setTimeout(playPattern, nextDelay);
    };

    this.rhythmTimer = window.setTimeout(playPattern, 500);
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
    amp.gain.exponentialRampToValueAtTime(gain, time + 0.006);
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
    duration = 0.18,
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
      Math.max(80, frequency * 0.82),
      time + duration
    );

    filter.type = "bandpass";
    filter.frequency.value = frequency * 2.55;
    filter.Q.value = 3.2;

    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(gain, time + 0.008);
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
    osc.stop(time + duration + 0.04);
  }

  playCoconutKnock({
    time,
    gain = 0.04,
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
  osc.frequency.setValueAtTime(132, time);
osc.frequency.exponentialRampToValueAtTime(72, time + 0.11);

    filter.type = "lowpass";
   filter.frequency.value = 420;
filter.Q.value = 1.4;

    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(gain, time + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(destination);

    osc.start(time);
    osc.stop(time + 0.15);
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
    pop.frequency.setValueAtTime(150 + intensity * 34, time);
    pop.frequency.exponentialRampToValueAtTime(92, time + 0.075);

    popFilter.type = "lowpass";
    popFilter.frequency.value = 980;
    popFilter.Q.value = 0.42;

    popGain.gain.setValueAtTime(0.0001, time);
   popGain.gain.exponentialRampToValueAtTime(
  0.026 + intensity * 0.008,
  time + 0.007
);
    popGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.095);

    pop.connect(popFilter);
    popFilter.connect(popGain);
    popGain.connect(destination);

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

    this.ensureAmbient();

    const now = ctx.currentTime;
    const clampedIntensity = Math.min(1.4, Math.max(0.7, intensity));

    // Short blade swipe, not a constant ambience.
    this.createNoiseBurst({
  time: now,
  duration: 0.06,
  gain: 0.024 + clampedIntensity * 0.01,
  filterType: "bandpass",
  frequency: 760 + clampedIntensity * 260,
  q: 0.95,
  destination: this.sliceBus,
});

    // Juicy pop.
    this.playJuicyPop(now + 0.014, clampedIntensity, this.sliceBus);

    // Coconut knock gives the slice a tactile hit.
    this.playCoconutKnock({
  time: now + 0.022,
  gain: 0.072 + clampedIntensity * 0.026,
  destination: this.sliceBus,
});

    // Marimba / toy pluck.
    const noteSet = [392, 440, 493.88, 523.25, 587.33, 659.25];
    const noteIndex = Math.min(
      noteSet.length - 1,
      Math.floor((clampedIntensity - 0.7) * 4.2)
    );

    this.playWoodPluck({
  time: now + 0.045,
  frequency: noteSet[noteIndex],
  gain: 0.024 + clampedIntensity * 0.012,
  duration: 0.16,
  destination: this.sliceBus,
  pan: Math.random() * 0.16 - 0.08,
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

    // Crunchy spiky crack.
    this.createNoiseBurst({
      time: now,
      duration: 0.14,
      gain: 0.15 + clampedIntensity * 0.05,
      filterType: "bandpass",
      frequency: 540 + clampedIntensity * 260,
      q: 2.4,
      destination: this.sliceBus,
    });

    // Heavy coconut thud.
    this.playCoconutKnock({
      time: now + 0.012,
      gain: 0.13,
      destination: this.sliceBus,
    });

    // Sour wobble, clearly different from fruit.
    const wobble = ctx.createOscillator();
    const wobbleGain = ctx.createGain();
    const wobbleFilter = ctx.createBiquadFilter();

    wobble.type = "sawtooth";
    wobble.frequency.setValueAtTime(104, now);
    wobble.frequency.exponentialRampToValueAtTime(58, now + 0.25);

    wobbleFilter.type = "lowpass";
    wobbleFilter.frequency.value = 420;
    wobbleFilter.Q.value = 1.1;

    wobbleGain.gain.setValueAtTime(0.0001, now);
    wobbleGain.gain.exponentialRampToValueAtTime(0.048, now + 0.018);
    wobbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    wobble.connect(wobbleFilter);
    wobbleFilter.connect(wobbleGain);
    wobbleGain.connect(this.sliceBus);

    wobble.start(now);
    wobble.stop(now + 0.3);
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
      gain: 0.03,
      duration: 0.14,
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
        gain: 0.036 - index * 0.004,
        duration: 0.2,
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
    this.ambientGain.gain.linearRampToValueAtTime(nextLevel, now + 0.35);

    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(
      this.muted ? 0.0001 : Math.min(0.84, 0.68 + nextLevel * 0.75),
      now + 0.35
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
      warningLevel ? 0.045 : 0.0001,
      now + (warningLevel ? 0.12 : 0.2)
    );

    if (this.durianFilter) {
      this.durianFilter.frequency.cancelScheduledValues(now);
      this.durianFilter.frequency.setValueAtTime(
        this.durianFilter.frequency.value,
        now
      );
      this.durianFilter.frequency.linearRampToValueAtTime(
        warningLevel ? 430 : 300,
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