# bowl — plan & implementation spec

*a webcam-controlled slicing ritual. working title: bowl.*

---

## Part 0 — World & Ritual Brief

*Shared reading for Codex and Claude Code. The "why" before the "how."*

### The core reframe

**This is not a game. It is a self-care ritual with game mechanics.**

The player's motivation is: *"I want fruit. I don't have fruit. I play this and I enjoy."* That single sentence is the north star. Every design decision serves it. Difficulty never punishes. Missing fruit is fine — it goes in the bowl. Sound, pace, and visuals are slow, warm, and forgiving. The reward is not a score; it is the bowl of fruit you made.

Genre: cozy game / interactive meditation. Reference points: Alto's Odyssey, Journey, Monument Valley's quieter moments, Stardew Valley's ambient loops. **Not** Fruit Ninja proper — Fruit Ninja is the *mechanism*, not the *genre*.

### The sensory world

Summer vacation. Tropics. Bali, Lombok, Langkawi. Fresh fruit on the hottest day of the year. Humid air. Pandan and lemongrass. Rice fields at golden hour. Day at the beach, night at the resort. A breath of fresh air after a long week.

The player is transported *into* this world. The webcam isolates them from their real surroundings (segmentation) and composites them into a living tropical scene (looping video background). They are on vacation for the duration of play.

### Design principles

**Everything is soft.** No hard edges. Edges bloom slightly. Light diffuses. Text sits on warm backgrounds. Shadows are long and soft.

**Motion is lazy.** Nothing snaps. All easing is slow. The score drifts up, doesn't tick. Fruits arc slowly. Trails have slight drag. This is vacation motion, not arcade motion.

**The fruit is the hero.** UI is quiet. Background is alive but never competes. The player's attention belongs to the fruit.

**Culturally specific but not performative.** Southeast Asian fruit set. Durian as the bomb. English copy only — no Malay performance. The cultural grounding is in the *choice of fruit* and the *sensory world*, not in language.

**Forgiveness over punishment.** Missing a fruit is neutral — the fruit goes in the bowl. Hitting a durian ends the run, but the run already gave you a bowl. No failure state without a reward.

### Anti-patterns (explicitly forbidden)

Do not drift toward any of these. They belong to other projects or misread the brief:

- ❌ Amber terminal HUD aesthetic
- ❌ Glass plate / specimen / light-table framing
- ❌ Clash Display, DM Mono, Cabinet Grotesk as a system (individually fine, but not the ALBERS/noticing./portfolio trio)
- ❌ Brutalist, industrial, or utility-first visual language
- ❌ Neon, synthwave, retro-arcade
- ❌ Cartoon fruit (Saturday-morning TV, overly rendered, big shiny eyes). *Illustrated* watercolor fruit is the intended direction.
- ❌ Cluttered HUD, dashboard-style overlays
- ❌ Hard-edged geometry, strict grids, Swiss-school minimalism
- ❌ Black or dark backgrounds as the dominant field
- ❌ Tropical clichés (tiki torches, palm-tree silhouettes, hibiscus-in-hair stock imagery)
- ❌ Arcade-style numeric feedback (big combo numbers flashing, screen shake on every hit)
- ❌ Menu-driven navigation (the opening is a scene, not a menu)

### Naming

Working title: **bowl**. Lowercase. Final name TBD.

---

## Part A — Codex Build Spec

*Technical specification. Codex reads this and builds a fully-functional, visually-placeholder game. Visual polish is Claude Code's job in Part B.*

### Build in three phases — do not skip ahead

**Phase 1 ships before Phase 2 begins. Phase 2 ships before Phase 3 begins. Each phase ends with a playtest that gates the next.** This is non-negotiable. The reason: we do not know yet whether the core slicing feel works on the target hardware, and no amount of polish fixes broken mechanics. Build the skeleton, playtest, then add meat.

#### Phase 1 — Mechanics validation (placeholder visuals, no segmentation)

Goal: prove the game feels good to play. Ship the smallest thing that can be honestly playtested.

In scope:
- MediaPipe Hands only (no segmentation)
- Full webcam feed as background (plain, no tint, no environment video)
- Colored-circle fruits — each fruit is a filled circle in its `juiceColor` at its `sizeMult × fruitBaseSize`
- Colored-circle durian with an obvious warning outline (2px stroke in `warningColor`)
- Trail: one line per hand, different colors (any legible colors), simple stroke
- Particles: small filled dots in fruit's juice color, radial spray, gravity-applied, alpha fade
- Collision detection (segment-vs-circle, velocity-gated)
- Physics: spawn-from-bottom, gravity arc, fruit wobble
- Wave-based spawner, **one wave config only** (`waves/endless.js`)
- One game mode: **Endless**
- Score in system font, top-left
- 3-durian lives indicator in system font, top-right
- Game over: screen fades, score shown, "again" text to click or swipe
- No bowl yet
- No idle state yet
- No heat haze
- No birds
- No ambient audio — just slice sound (Web Audio synthesis: short noise burst)
- No mode select, no calibration, no opening scene — game starts immediately when hands are detected

Exit criteria (Pramit's playtest):
- Tracking feels responsive, no noticeable lag
- Slicing registers when swiping, does not register when resting
- Velocity threshold feels right
- Spawn pacing feels right (not too frantic, not too sparse)
- Game is honestly playable for 2+ minutes without frustration

**Only after Phase 1 passes playtest does Codex build Phase 2.**

#### Phase 2 — Full mechanics (still placeholder visuals)

Goal: every system in place, still visually raw.

In scope:
- MediaPipe Selfie Segmentation added alongside Hands
- Environment video as background (player composited via segmentation)
- All three game modes: Endless, Timed, Sunset
- Mode-select screen (placeholder — three text buttons)
- Calibration screen (placeholder — "raise your hand" in system font)
- Opening scene state
- Bowl system (invisible physics during play, composition pass at game over)
- Bowl reveal screen at game over (placeholder: brown circle for coconut shell, fruits as colored circles arranged inside)
- Idle state + firefly drift
- Heat haze (functional, tuning values not final)
- Bird drift (placeholder triangle silhouettes)
- Ambient audio bed (synthesized pad)
- Fruit-specific behaviors from the data table (spin, cluster, splatter, reveal, etc.)
- Durian warning hum audio
- Performance monitoring + Lite mode auto-fallback

Exit criteria:
- Everything works together without breaking
- Segmentation performs acceptably on target hardware
- All three modes feel distinct
- Bowl reveal reads as satisfying, even with placeholder circles
- FPS holds above 40 on Pramit's machine

**Only after Phase 2 passes playtest does Pramit start sourcing/generating assets for Phase 3.**

#### Phase 3 — Art & sound pass

Goal: final visual and audio polish. This is where Claude Code takes over per Part B, based on the Figma mockups.

In scope:
- Replace all placeholder visuals with sourced/generated fruit illustrations
- Replace placeholder bowl with real coconut shell asset
- Replace placeholder birds with real bird silhouettes
- Replace placeholder environment with final looping beach video
- Apply full design system (Reenie Beanie + Fraunces, cream/coconut/pandan/hibiscus palette)
- Motion polish across all screens
- Final sound design (source samples + synthesized layers)
- Share image composition (v1.5)
- Day-to-night color grade in Sunset mode (v1.5)

### Tech stack

- **Vanilla JavaScript.** No build step. No framework. ES modules.
- **HTML5 Canvas 2D** for game rendering.
- **MediaPipe Tasks Vision API** (`@mediapipe/tasks-vision`) for hand tracking and segmentation. Load via CDN. Do **not** use the legacy `@mediapipe/hands` package.
- **Web Audio API** for sound synthesis and playback.
- **HTML5 `<video>` element** for the looping environment background.
- **Static hosting** — deploys to Vercel as-is, no bundler.

### File structure

```
bowl/
├── index.html              // shell: canvas, video element, hidden webcam feed
├── styles.css              // minimal — only layout rules and placeholder HUD styling
├── assets/
│   ├── fruits/             // 10 fruits × (whole + left-half + right-half) = 30 images
│   ├── durian/             // whole durian only (no sliced variant)
│   ├── bowl/               // coconut shell photograph(s)
│   ├── birds/              // 1–2 bird silhouettes (SVG)
│   ├── environment/        // beach.mp4 (looping video)
│   └── sounds/             // sourced sound files (see Part C)
├── src/
│   ├── main.js             // entry point, game loop, state machine
│   ├── config.js           // all tunable constants
│   ├── vision.js           // MediaPipe Hands + Selfie Segmentation
│   ├── compositor.js       // composes environment + segmented player + effects
│   ├── trail.js            // two-handed trail data + rendering
│   ├── slice.js            // collision detection between trail segments and fruits
│   ├── spawner.js          // wave-based fruit/durian spawning
│   ├── waves.js            // wave definitions per game mode (JSON-like configs)
│   ├── entities.js         // Fruit, Durian, SliceHalf, Particle classes
│   ├── physics.js          // gravity, arcs, wobble
│   ├── particles.js        // juice bursts, durian warning particles
│   ├── bowl.js             // invisible bowl physics + end-of-game composition
│   ├── environment.js      // environment module loader + haze + birds
│   ├── haze.js             // full-screen horizontal heat-haze shader
│   ├── audio.js            // Web Audio graph, ambient bed, slice sounds
│   ├── hud.js              // placeholder top bar: mode / time / settings
│   ├── states.js           // opening, calibration, mode-select, play, idle, gameover
│   └── perf.js             // FPS monitoring + auto Lite mode
```

### Tech stack notes

- **Why Canvas 2D over WebGL:** faster to ship, sufficient for our scale, easier for Claude Code to tune visually. If heat haze turns out to need a shader for performance, we drop to a tiny WebGL pass for just that effect — but every other render target stays Canvas 2D.
- **Why no framework:** zero build complexity, instant deploy, matches the player's Vercel hosting setup.
- **Why MediaPipe Tasks Vision (not legacy):** the legacy API is deprecated, the Tasks Vision API is what Google actively maintains, the latency is better, and the model files are hosted on Google's CDN.

### MediaPipe setup

Two models run concurrently from the same webcam stream:

1. **HandLandmarker** — detects up to 2 hands, 21 landmarks per hand. We care primarily about landmark 8 (index fingertip) for slicing.
2. **ImageSegmenter** (or SelfieSegmenter) — produces a per-pixel mask separating the player from their background. We apply this mask to cut the player out and composite them onto the environment video.

**Webcam feed is mirrored** (`videoElement.style.transform = 'scaleX(-1)'` or equivalent on canvas draw) so the player's left hand appears on the left of the screen.

**Frame pipeline (per frame):**
1. Grab webcam frame (hidden video element)
2. Run HandLandmarker → array of hand objects with landmarks
3. Run ImageSegmenter → binary/alpha mask
4. Compositor draws: environment video → masked player → fruits → particles → trails → haze → HUD

### Game state machine

States, transitions:

```
OPENING            → raise hand detected → CALIBRATION
CALIBRATION        → hand tracking stable 2s → MODE_SELECT
MODE_SELECT        → mode chosen by hand swipe → PLAY
PLAY               → no movement 15s → IDLE
                   → mode end condition → GAMEOVER
IDLE               → movement detected → PLAY (no announcement)
GAMEOVER           → "again" selected → CALIBRATION (not back to OPENING — skip the intro)
```

Game modes:
- **ENDLESS** — no time limit, ends on 3rd durian hit
- **TIMED** — 90 seconds, 3 durian hits still ends it early
- **SUNSET** — variable length (5–8 min), ends when the sunset progression completes or on 3rd durian

### Config (`config.js`)

All tunable constants live here. Claude Code should never touch game logic — it edits `config.js` and visual modules. Examples:

```js
export const CONFIG = {
  // Viewport
  aspectRatio: 16 / 9,

  // Hand tracking
  minHandConfidence: 0.5,
  trailMaxPoints: 20,
  trailDecayMs: 400,
  sliceVelocityThreshold: 800,  // px/sec — below this, trail exists but doesn't slice

  // Fruit
  fruitBaseSize: 120,           // px diameter, scaled by fruit.sizeMultiplier
  gravity: 900,                 // px/sec²
  fruitSpawnYOffset: 100,       // spawn below viewport by this amount
  fruitArcPeakVariance: 0.3,    // ±30% randomization on arc peak height

  // Durian
  durianWarnHumFreq: 80,        // Hz — low audible hum while durian is in flight
  durianImpactDurationMs: 1500, // how long game-over transition takes

  // Bowl
  bowlGravity: 1200,            // faster than fruit gravity — missed fruits fall "into" bowl quickly
  bowlCompositionPassDurationMs: 600, // ease from physics to aesthetic arrangement

  // Idle
  idleThresholdMs: 15000,
  idleFireflySpawnRate: 0.3,    // per second during idle

  // Heat haze
  hazeAmplitude: 2,             // px max displacement
  hazeWavePeriodMs: 4000,
  hazeBandCount: 4,
  hazeEnabled: true,            // auto-disabled in Lite mode

  // Performance
  targetFps: 60,
  liteFpsThreshold: 40,         // if avg FPS drops below this for 3s, enable Lite mode
};
```

### Wave-based spawner

Inspired by Luke Muscat's original Fruit Ninja wave system. Each game mode has an array of wave definitions. The spawner steps through waves. Each wave emits `countMin`–`countMax` entities over `waveDuration` seconds, then waits `nextWaveDelay` before starting the next wave.

**Wave definition shape:**

```js
{
  id: 1,
  spawnTypes: ["fruit"],            // possible: "fruit", "durian". Repeat for weighting: ["fruit","fruit","durian"] = 33% durian
  fruitPool: "all",                 // or a specific array like ["mango","lychee"]
  countMin: 2,
  countMax: 3,
  spawnDelay: 0.9,                  // sec between spawns within this wave
  waveDuration: 2.5,                // total sec this wave lasts
  nextWaveDelay: 1.2,               // sec of pause before next wave
  burstPattern: "scattered"         // "scattered" | "cluster" | "line" | "arc"
}
```

**Wave configs per game mode** (starter values — Claude Code tunes later):

- `waves/endless.js` — infinite loop over a 12-wave progression that plateaus at high density. First 3 waves: no durian. Wave 4+: durian possible.
- `waves/timed.js` — exactly 10 waves fitting into 90 seconds. Intense but fair.
- `waves/sunset.js` — 20 waves tied to sunset progression. Starts *very* sparse (2 fruits per wave, 2-second pauses). Ramps gradually. Final 3 waves are denser as "sun sets." Durian introduced at wave 6.

### Fruit data table (`entities.js`)

```js
export const FRUITS = {
  watermelon:  { sizeMult: 1.4, weight: 1.4, score: 10, juiceColor: "#e63946", behavior: "heavy",     wobbleAmp: 0.02 },
  pineapple:   { sizeMult: 1.3, weight: 1.3, score: 12, juiceColor: "#f4c430", behavior: "slow",      wobbleAmp: 0.03 },
  mango:       { sizeMult: 1.0, weight: 1.0, score: 10, juiceColor: "#ffa94d", behavior: "default",   wobbleAmp: 0.05 },
  papaya:      { sizeMult: 1.2, weight: 1.1, score: 10, juiceColor: "#ff6b35", behavior: "large",     wobbleAmp: 0.04 },
  dragonfruit: { sizeMult: 1.0, weight: 1.0, score: 15, juiceColor: "#d81b7a", behavior: "splatter",  wobbleAmp: 0.05 },
  mangosteen:  { sizeMult: 0.8, weight: 0.9, score: 15, juiceColor: "#6a4c93", behavior: "reveal",    wobbleAmp: 0.06 },
  rambutan:    { sizeMult: 0.6, weight: 0.6, score: 20, juiceColor: "#c1121f", behavior: "fast",      wobbleAmp: 0.08 },
  starfruit:   { sizeMult: 0.9, weight: 0.8, score: 15, juiceColor: "#fcd34d", behavior: "spin",      wobbleAmp: 0.10 },
  lychee:      { sizeMult: 0.5, weight: 0.5, score: 20, juiceColor: "#fecaca", behavior: "cluster",   wobbleAmp: 0.08 },
  guava:       { sizeMult: 0.9, weight: 0.9, score: 10, juiceColor: "#fca5a5", behavior: "default",   wobbleAmp: 0.05 },
};

export const DURIAN = {
  sizeMult: 1.2, weight: 1.2, score: 0, warningColor: "#c5c533", behavior: "warning", wobbleAmp: 0.02
};
```

**Behavior meanings:**
- `heavy` — lower arc peak, slower
- `slow` — normal arc, reduced horizontal velocity
- `default` — standard arc
- `large` — oversized render, splits into large halves
- `splatter` — 2× normal particle count on slice
- `reveal` — brief 200ms slow-motion on clean center slice
- `fast` — higher arc peak, faster horizontal velocity
- `spin` — continuous rotation while in flight
- `cluster` — spawns 3 lychees together in a tight formation
- `warning` — durian specific: emits low-frequency hum while in flight

### Trail system

Per hand (up to 2 active hands):
- Ring buffer of last N fingertip positions with timestamps
- Compute per-segment velocity (px/sec) from consecutive points + timestamps
- Render trail as a smooth curve (quadratic or cubic Bézier through points) with:
  - Opacity fading toward the tail (older points)
  - Width tapering toward the tail
  - Color per hand (right hand slightly warmer, left hand slightly cooler — **placeholder** for Claude Code to redesign)

**Slice detection:** iterate trail segments, for each segment check velocity. If velocity ≥ `sliceVelocityThreshold`, test intersection against every active fruit's bounding circle. Segment-vs-circle intersection is a standard geometry operation. On hit: emit particles, split fruit into two halves, remove fruit from active entities, increment score.

**No "angle matters" in v1.** Halves split with a default vertical cut. v2 can compute slice angle from the intersecting segment's direction and rotate the halves accordingly.

### Physics

Fruits and durians spawn below the viewport bottom edge (Y = `viewport.height + fruitSpawnYOffset`) with:
- Initial upward velocity (negative Y) sized to peak roughly in the upper third of the viewport
- Initial horizontal velocity (random left/right, weighted toward center convergence)
- Gravity (`config.gravity`) applies constantly
- Slight wobble per fruit type (sine-wave Y offset added during render, not physics)

Fruits fall off the bottom when Y > viewport.height (or a bit below, for smoothness). On fall-off, they transition to the bowl system.

Halves (post-slice) get physics applied identically — they arc the rest of their path with gravity, slight spin, and fall off-screen. They do **not** go to the bowl (they're "consumed").

### Particles

- **Juice burst on slice:** 12–20 particles emitted at slice point, random outward velocity, fruit's `juiceColor`, gravity applied, fade over ~800ms.
- **Durian warning puff:** when durian is in flight, every ~300ms emit a small sickly-yellow particle that drifts behind it. Makes it readable at a glance.
- **Durian impact:** on durian slice, a large splash of `warningColor` particles + screen-wide warm yellow-green flash (one-frame, easing out) + low-frequency audio thump.

Particles are simple Canvas 2D circles with alpha fade. **No complex shapes in v1** — Claude Code refines in the visual pass.

### Bowl system

**During play:**
- When a fruit falls off the bottom of the viewport, it transitions to `bowl.push(fruit)`.
- The bowl runs its own simple physics simulation **off-screen**: fruits accumulate with gravity + simple pile collision (circle-circle stacking).
- The bowl is never rendered during PLAY state.

**At game over:**
- A compositing pass runs once: each fruit's final position is nudged slightly to avoid full occlusion and excessive overlap (a lightweight optimization: shift fruit by up to 10% of its radius if >40% occluded).
- The bowl image (coconut shell, sourced asset) fades in centered on screen.
- Fruits fade in inside the bowl at their composed positions, with a slight stagger (20–40ms between fruits).
- Score and "again" affordance fade in last.

**Durian is never added to the bowl.** If the player hit a durian, the bowl still shows normally — just their cut fruit.

### Environment module

Each environment is a folder with:
- `video.mp4` — looping background (muted)
- `ambient.mp3` — looping ambient audio bed
- `config.js` — palette overrides, haze intensity, bird frequency

The environment module system loads one environment at a time. For v1, only one environment ships: `environments/default/` (beach, waves, gentle ambient).

**Environment video playback:**
- Loaded as a hidden `<video>` element, `loop muted playsinline autoplay`
- Each frame the compositor draws the current video frame to canvas as the background
- Environment video is drawn **first** (bottom layer), everything else is painted on top

### Heat haze

Full-screen horizontal displacement effect:
- Divide the canvas into `hazeBandCount` horizontal bands
- Each band has a sine wave with phase offset
- On each frame, re-draw the already-composited scene with slight horizontal pixel offsets per band
- Amplitude: `hazeAmplitude` px max
- Disabled when Lite mode is active
- Visually: the scene behind the player subtly shimmers; the player themselves shimmers less (we apply haze to the full composite including the player — if performance allows, we can mask the player out of the haze pass for v2)

**Implementation approach:** most efficient path is to render everything to an offscreen canvas, then blit band-by-band to the main canvas with per-band horizontal offset. If performance is insufficient, fall back to a small WebGL pass (single shader) for just this effect.

### Birds

Independent ambient element. Once every 30–60 seconds, spawn a bird silhouette at the left or right edge, traveling slowly across the screen. Loaded as SVG, animated via position tween (8–12 seconds to cross). Does not interact with anything. Drawn on the environment layer (behind the player, in front of the video).

### Fruit wobble

Applied only during render. Each fruit has a `wobbleAmp` value from the data table. While in flight, apply a tiny rotational or positional sine-wave offset. Gives the fruit life without breaking physics.

### Idle state

Trigger: no hand has moved more than `idleMovementThreshold` (e.g., 15 px) for `idleThresholdMs` (15 seconds).

On idle enter:
- Fruit spawner pauses
- Existing in-flight fruits finish their arcs normally
- Ambient audio bed rises ~3dB
- Firefly particles begin drifting across the screen (rare, slow, soft glow)

On idle exit (any fingertip movement ≥ threshold):
- Fireflies fade out over ~1 second
- Spawner resumes immediately, starting from the current wave
- Ambient bed returns to normal level
- No announcement, no text — seamless return

### Sunset mode progression

This is the signature mode. A 5–8 minute session with the scene's *light* changing throughout.

The environment module supports a **time-of-day parameter** (0.0 = bright midday, 1.0 = full dusk). Over the course of a Sunset-mode session, this parameter ramps from 0.0 to 1.0 linearly.

At each value, the compositor applies:
- A color grade overlay (tint curve) to the environment video
- An ambient audio crossfade (midday layer → golden hour layer → evening layer)
- A heat haze amplitude curve (starts at full amplitude, decreases to near-zero at dusk)

**No time-remaining UI in Sunset mode.** The light is the clock.

### Performance & Lite mode

Monitor average FPS over a rolling 3-second window. If it drops below `liteFpsThreshold` (40 by default), enter **Lite mode**:
- Disable heat haze
- Disable segmentation (fall back to tinted full webcam as background, no environment video)
- Reduce particle count by 50%
- Reduce trail point resolution

Lite mode is **automatic** but logged to the console. Also exposed as a manual toggle in Settings.

### Placeholder visuals policy

Codex ships with ugly-but-functional visuals. This is intentional. Specifically:

- Fruits: use the sourced images if available, otherwise flat colored circles with a letter label
- Durian: orange-red circle with a warning icon
- Trail: a single-color line, no gradients
- HUD: system font, three text labels top of screen, no styling
- Bowl: a drawn brown circle for placeholder, replaced with the sourced coconut-shell image
- Particles: solid-color circles
- Heat haze: functional but minimally tuned
- Birds: simple SVG shapes

**Codex must not spend effort on aesthetics.** That is Claude Code's job in Part B. Every visual detail in Codex's build is a placeholder.

---

## Part B — Claude Code Creative Brief

*Claude Code executes this during Phase 3. No Figma mockups exist — Claude Code makes the creative calls within the defined system below. The brief gives boundaries tight enough that decisions are constrained but loose enough that Claude Code can use its taste.*

### How to read this brief

Re-read Part 0 first. The vacation feeling, the self-care reframe, and the anti-pattern list are the frame for every decision. The design principles (*everything is soft, motion is lazy, fruit is the hero, forgiveness over punishment*) are the operating philosophy. When in doubt about any specific design choice, return to Part 0.

### Locked design system

Claude Code does not decide these — they are fixed.

#### Typography

**Two-font system:**

- **Reenie Beanie** (Google Fonts) — display and expressive type. Use for: score numbers, game-over text, scene cues ("raise your hands", "begin"), "again?" prompt, mode labels in mode-select, combo numbers when they appear, bowl reveal title.
- **Fraunces** (Google Fonts — use the variable font with italic) — functional type. Use Regular for body, Italic for emphasis and captions. Use for: time remaining, settings text, small labels, share image caption, mode descriptions under labels, any information type.

**Sizing rules:**
- Reenie Beanie minimum 28pt. Below this, letterforms become mush. Game score and titles should be 80–140pt. Section cues 60–90pt.
- Fraunces handles small work. Body 18pt. Captions 14–16pt. Settings labels 14pt.
- Never track Reenie Beanie (letter-spacing breaks it). Slightly track Fraunces at small sizes (0.01em).

**Both typefaces use coconut brown (`#2a1f18`) as ink, never pure black, never on pure white.**

#### Color palette

| Role | Name | Hex | Rules |
|---|---|---|---|
| Base | Coconut cream | `#f4ebd9` | Primary field for quiet moments (bowl reveal, mode select, game over). Never used as a small accent. |
| Ink | Coconut brown | `#2a1f18` | All type. Hairlines. Never pure black. |
| Hero accent | Pandan green | `#c5d86d` | The signature color. Selected state, active mode, key affordances. This is "the brand." |
| Hot accent | Hibiscus red | `#d94423` | One use per screen maximum. The most important thing. |
| Warm secondary | Evening amber | `#e6a85c` | Sunset mode progression only. Do not scatter elsewhere. |
| Warning | Durian yellow-green | `#c5c533` | Exclusively for durian. Never reused. |
| Dim | Muted brown | `#8a7a6d` | Inactive states, secondary text, hairlines on cream. |

**Rules:**
- One hot accent per screen (pick the single most important element)
- Pandan green is the brand — when uncertain what color something should be, pandan is the answer
- Durian yellow-green is sacred — never use for anything that isn't durian
- Amber is only for Sunset mode progression
- Cream is a field, never an accent
- Brown ink (`#2a1f18`), never black

#### Motion principles

Every animation obeys these three rules:

1. **Lazy, not snappy.** Ease-out curves. Durations on the slower end of what you'd normally use. If a standard UI transition is 200ms, ours is 400ms. The score doesn't tick up — it drifts up. Fruit doesn't snap in — it floats in.
2. **Nothing lands hard.** Every animation has a soft arrival. No bouncy springs. No overshoot. Gentle deceleration.
3. **Ambient motion is always present.** Even "static" screens breathe. The cream background should have subtle grain or very slow gradient drift. Type fades in one element at a time with 40–80ms stagger. Nothing is ever truly still.

### Creative latitude — where Claude Code decides

For each area below, Claude Code uses taste within the locked system above. The design principles from Part 0 guide every choice.

#### Trail rendering

The trail is the player's weapon and their signature. Make it feel like watercolor wet-on-wet painting in the air.

Constraints:
- Two hands get subtly differentiated trails. Not wildly different — same family, one slightly warmer, one slightly cooler.
- Trail color: stay in the project palette. A cream-to-pandan gradient, a cream-to-hibiscus gradient, or a soft variation on those — Claude Code picks.
- Tapered width: wider at fingertip, fading to thin at the tail.
- Opacity fades to zero at the tail.
- When moving fast enough to slice, trail can gain subtle glow/intensity — restrained, not neon.

Avoid: sharp edges, solid lines, neon/synthwave glow, hard-edged light saber aesthetics.

#### Particle and juice system

When fruit is sliced, particles should feel like *wet pigment splashing*, not cartoon squirts. Visible "ink drops" that bleed slightly at their edges.

Constraints:
- Particle color: the fruit's `juiceColor` from the data table.
- Shape: soft-edged circles (blur filter or radial gradient), not hard circles. Varied sizes in each burst.
- Motion: outward radial spray, gravity pulls down, random slight rotation.
- Fade: alpha to zero over ~800ms.
- Count: 12–25 per slice depending on fruit (`splatter` behavior gets 2×).

For durian: a puff of durian yellow-green follows durian in flight — sparse, intermittent, readable. On durian impact: a full-screen warm yellow-green flash (one frame, easing out) + larger particle burst.

#### Fruit rendering (during placeholder phase → through to final)

Phase 1–2: colored circles.

Phase 3: the watercolor illustration assets Pramit provides. Render with:
- Very subtle drop shadow (brown ink, low opacity, blurred) to lift fruit off the scene — not realistic physics shadow, just a hint of depth.
- Slight wobble/rotation while in flight (already in config).
- On slice: halves split and arc away with physics. Fade slightly as they fall off-screen. Do not add visual embellishment beyond the existing physics.

#### HUD (top bar during play)

Based on the reference mockup: three elements across the top. Mode / Time / Settings.

Constraints:
- Mode label (left): Reenie Beanie, medium size, coconut brown on cream-at-80%-opacity background pill, or just floating on the scene with no background if it reads legibly.
- Time remaining / score / life indicator (center or right): see mode-specific notes below.
- Settings (right): small icon or the word "settings" in Fraunces. Clicking opens a minimal panel.

Mode-specific:
- **Endless mode**: No time shown. Three small durian-dot indicators somewhere to show lives. When life lost, dot fades to dim color (not removed).
- **Timed mode**: Time remaining in Fraunces at top-center. Minimal numeric ("1:23"). Counts down quietly.
- **Sunset mode**: **No time UI at all.** The light in the environment tells you. This is a deliberate absence.

Score: top-left or wherever doesn't fight Mode label. Reenie Beanie large. Coconut brown. Should "drift up" when incrementing, not tick.

#### Mode select screen

No menu feel. Scene is still alive — environment video still plays, player still segmented in.

Three mode options appear in the scene. Reenie Beanie large, positioned with generous negative space. Each has a tiny Fraunces italic descriptor underneath:

- *endless* / a short phrase in Fraunces italic describing the mood
- *timed* / a short phrase
- *sunset* / a short phrase (note the default selection hint — this is the signature mode)

Claude Code writes the mood descriptors. Keep them short, sensory, not instructional. Avoid "score as many as you can" or anything game-y. Think more like menu items at a thoughtful restaurant.

Selection: player hovers fingertip over the word for ~1 second, it fills with pandan green or underlines, then the game begins.

#### Opening / calibration

When the player loads: scene is alive (environment video, audio bed starts faintly). No UI. After 1–2 seconds, a single cue fades in using Reenie Beanie: *raise your hands* or similar. Claude Code picks the exact words — keep it gentle, inviting, not instructional.

When hands are detected, the cue fades out. A brief confirmation: a soft pulse of pandan green at each fingertip. Then transition to mode select.

#### Game over / bowl reveal

The most important visual moment in the project. Gets more care than any other screen.

Flow:
1. On durian hit or mode end, gameplay freezes softly (slight slow-mo).
2. A single punctuating sound plays (sourced sample — bamboo wind chime or similar).
3. Everything except the environment background fades out.
4. The coconut shell fades in, centered, sized generously (40–50% of viewport height).
5. Fruits from the bowl fade in inside the shell one by one, 30–60ms stagger, with subtle position nudges for visual balance (composition pass).
6. Score appears above or beside the bowl. Reenie Beanie large. Coconut brown.
7. A small Fraunces italic caption appears near the score — Claude Code writes this. Something quiet. "a bowl of fruit" or "what you made today" or similar — no more than 4 words, sensory not score-y.
8. An "again?" prompt appears below. Reenie Beanie. Player swipes or hovers to restart.

Ambient audio continues throughout. No hard cuts.

#### Idle state

When the player stops moving for 15 seconds:
- Spawner pauses (already in Codex)
- Audio bed rises subtly (Claude Code tunes the amount)
- Fireflies drift across the scene — Claude Code designs the firefly: small soft-glow dot, warm color (amber or cream at high opacity), drifts slowly on a random path, fades in and out
- Firefly spawn rate: sparse. One every few seconds, never more than 3 on screen.

No text appears. The scene becomes more atmospheric, not more instructive.

When movement resumes: fireflies fade over ~1 second, spawner resumes. No announcement.

#### Heat haze tuning

The code is already written by Codex. Claude Code tunes values in `config.js`:
- Amplitude: start at 2px, adjust up or down based on how it reads
- Wave period: 4000ms is the starter — feel free to vary
- Band count: 4 is the starter
- Should be **noticeable when you look for it, invisible when you're playing**. A subliminal warmth. If it's obviously shimmering, it's too much.

#### Bird drift

Claude Code decides bird frequency, silhouette design (from the provided SVG assets), flight path (straight, slightly curved, multiple birds occasionally), speed. Birds are decoration — they never interact with gameplay.

Rule: one bird in view at most. Spawn interval random 30–90 seconds. Travel 8–12 seconds across the screen. Bird color: coconut brown at 40–60% opacity — soft silhouette, not solid.

#### Sound design

**Synthesized via Web Audio (Claude Code implements in `audio.js`):**
- **Ambient bed** — warm low pad. Layered sine waves around 80–200Hz. Very slow amplitude modulation. Subtle.
- **Score-rise tone** — soft bell or sine blip when score increments. Tuned to a pentatonic scale so consecutive scores sound musical, not mechanical.
- **Combo stinger** — gamelan-adjacent chime when combo triggers. Claude Code implements with sine/triangle oscillators and soft envelopes.
- **Firefly chime** — very quiet, sparse, used during idle state only.
- **Durian warning hum** — continuous low 80Hz tone while durian is in flight. Low-passed noise layered underneath.

**To source (Freesound.org, CC0 or attribution-acceptable):**
- **Slice whoosh** — knife through fruit, wet. 1–2 variations.
- **Juice splat** — wet burst. 2–3 variations for variety.
- **Thunk** — soft off-screen impact when fruit falls (even though bowl is invisible).
- **Durian impact** — heavy bass-heavy thud.
- **Bamboo wind chime** — the single punctuating sound at game over.
- **Surf loop** — ambient bed layer.
- **Cicadas, distant** — ambient bed layer.
- **Ceiling fan hum** — very quiet, adds warmth.

Audio mix: ambient bed sits quietly under everything. Slice/splat samples pop above. Wind chime at game over is the loudest moment. Durian warning hum grows as it approaches, then impact thud resolves it.

Claude Code handles the full Web Audio graph — ambient loops, sample playback, volume automation, ducking during critical moments.

### Share image composition (v1.5 — do not implement in Phase 3)

Deferred to v1.5. When built:
- Square format, 1080×1080
- Coconut shell with fruit, centered, on coconut cream field
- Small Fraunces italic caption at bottom: date + short phrase
- No app branding unless Pramit decides otherwise
- Rendered to canvas, downloadable as PNG

### Files Claude Code is allowed to touch

- `styles.css`
- `src/hud.js`
- `src/trail.js` (render function only; data logic stays Codex-owned)
- `src/particles.js` (render only)
- `src/bowl.js` (render/composition pass only)
- `src/environment.js`
- `src/haze.js` (tuning values only — core displacement logic is Codex)
- `src/audio.js`
- `assets/*`
- `src/config.js` (tuning values only)

### Files Claude Code must not modify

- `src/main.js`
- `src/vision.js`
- `src/slice.js`
- `src/physics.js`
- `src/spawner.js`
- `src/states.js`
- `src/perf.js`
- `src/entities.js`
- `src/waves.js`

This separation protects the working logic from context-heavy creative passes.

### Pass order (to conserve Claude Code context)

Do **not** try to polish everything in one session. Claude Code hits context limits. Instead, run focused passes, one subsystem at a time:

1. **Pass 1 — Design system foundation.** Set up CSS with palette variables, load both fonts, establish base styles. Update HUD from system font to Reenie Beanie + Fraunces. No other changes.
2. **Pass 2 — Trail and particles.** Beautiful trails + watercolor-splat particles. Trail gradients, particle shapes, slice moment feel.
3. **Pass 3 — Bowl reveal.** The game-over moment, composition, timing, caption, sound punctuation.
4. **Pass 4 — Mode select + opening + calibration.** The scene-based non-menu UX.
5. **Pass 5 — Audio system.** Full Web Audio graph + sample integration.
6. **Pass 6 — Ambient polish.** Heat haze tuning, birds, idle state fireflies, subtle background grain.
7. **Pass 7 — Final playtest polish.** Whatever Pramit reports as not-quite-right.

Each pass is a fresh Claude Code session. Hand it only the files relevant to that pass. Do not reload the whole project every time.

---

## Part C — Asset & Sound Sourcing Checklist

*For Pramit. **Do not start sourcing until Phase 2 passes playtest.** Sourcing before mechanics are proven wastes effort if the game needs reshape.*

### Fruit images (31 total)

**Style: loose watercolor illustration.** Children's book quality, visible brush strokes, wet pigment edges. Decided direction — pairs with Reenie Beanie handwritten type.

**Format:** transparent PNG (background removed via remove.bg or similar), ~1000–1500 px on longest edge, high quality, no ground shadow.

**10 fruits × 3 variants each = 30 images:**

1. Watermelon — whole, left half (sliced), right half (sliced)
2. Pineapple — whole, left half, right half
3. Mango — whole, left half, right half
4. Papaya — whole, left half, right half
5. Dragon fruit — whole, left half, right half
6. Mangosteen — whole, left half, right half
7. Rambutan — whole, left half, right half
8. Starfruit — whole, left half, right half
9. Lychee — whole, left half, right half
10. Guava — whole, left half, right half

**Durian:** 1 whole image only (never shown sliced).

**Generation workflow:**
1. Lock the style with a test fruit (mango). Iterate until the watercolor character is genuine (visible brushstrokes, pigment bleeding, not digital-illustration-pretending-to-be-watercolor).
2. Once locked, reuse the same prompt template for all other fruits — only swap the fruit name.
3. For cross-sections: generate one image of the fruit "cut in half, cross-section facing viewer." Split vertically in Photoshop/Figma, mirror if needed so cut edges face inward.
4. Background removal pass (remove.bg) on every image.
5. Crop to consistent square canvas.

**Tools:** Midjourney ($10/mo, best for illustrated styles), Flux on Replicate ($0.003/image, pay-per-use), DALL·E 3. Use reference-image mode if available to lock style across batch.

### Coconut shell (bowl)

**Format:** transparent PNG, ~1500 px wide, high quality.

1–2 photographs of an empty coconut shell half. Top-down view is primary. Three-quarter angle is secondary (used for share image composition). Natural, minimally styled.

### Environment video

**Format:** MP4 (H.264), seamless loop, muted, 10–20 seconds, <10 MB, 1920×1080.

Wide horizontal beach scene. Waves rolling gently. Negative space in the center-right for the player to stand in. Sources: Pexels, Pixabay, Coverr — all free. Filter for "seamless loop" when possible.

### Birds

1–2 bird silhouettes as SVG. Simple shapes. Small (~40–80 px displayed).

### Sounds

**To be synthesized by Claude Code (Web Audio):**
- Ambient pad (low, warm drone)
- Score-rise tone (soft, rising)
- Combo stinger (gamelan-adjacent chime)
- Firefly chime (idle state)
- Durian warning hum (low 80 Hz continuous while in flight)

**To be sourced (Freesound, Zapsplat, or similar — all free-licensed):**
- Slice whoosh (knife cutting through fruit)
- Juice splat (wet, varied per fruit)
- Thunk (fruit landing — even though bowl isn't visible during play, audio cue confirms a miss)
- Durian impact (heavy, bass-heavy thud)
- Bamboo wind chime (game-over moment)
- Surf (ambient bed, looping)
- Cicadas (distant, layered into ambient bed)
- Ceiling fan hum (very quiet, adds warmth)

### Design system (from Figma)

**To finalize in Figma:**
- Display typeface (suggestion: Fraunces, GT Alpina, Migra, or Editorial New)
- Body typeface (warm sans or serif secondary)
- Full color palette with hex values (coconut cream base, pandan green, hibiscus accent, coconut brown, evening amber, sickly durian yellow-green)
- Spacing scale
- Opacity tokens

---

## Part D — Roadmap

### v1 — the ritual ships

- Core slicing with two hands
- 10 fruits + durian
- Three modes: Endless, Timed, Sunset
- One environment: beach with looping video
- Bowl reveal at game over (not shareable yet)
- Heat haze, birds, fruit wobble, idle state
- Lite mode auto-fallback
- Full visual pass based on Figma

### v1.5 — share & polish

- Shareable bowl (downloadable 1:1 image of the composed bowl with minimal caption)
- Day-to-night visual progression in Sunset mode (color grade over environment video)
- Achievement garnish (pandan leaf, lemongrass stalk, flower appearing in bowl based on play)
- Performance optimizations based on real-usage telemetry

### v2+ — expansion

- Additional environments (rice field, resort veranda, kitchen, pool deck, pasar malam evening)
- Angle-matters slicing (halves cut along the actual swipe angle)
- Looping video environments for more scenes
- Gesture-based pause (open palm)
- Optional one-handed-only mode for accessibility

---

## Appendix — Build sequence

The sequence is gated. Each step must pass before the next begins. This protects Pramit from investing in art before mechanics are proven, and protects Claude Code's context budget from being burned on a game that doesn't feel right yet.

1. **Codex reads Part 0 + Part A (Phase 1 scope only).** Builds the mechanics skeleton: MediaPipe Hands, colored-circle fruit, trail, slicing, physics, Endless mode, basic score, game over. No segmentation, no environment video, no bowl, no modes, no polish. Delivers something playable in a plain webcam window with circles for fruit.

2. **Pramit playtests Phase 1.** Checks tracking responsiveness, slice feel, velocity threshold, spawn pacing. Honest answer to: *does this feel good to play, even ugly?*
   - If no → iterate on mechanics before proceeding. Adjust velocity threshold, spawn timing, arc physics in `config.js` until it feels right.
   - If yes → proceed to Phase 2.

3. **Codex builds Phase 2.** Adds segmentation, environment video, all three modes, bowl system, idle state, heat haze, birds, ambient audio, fruit-specific behaviors, Lite mode. Still all placeholder visuals.

4. **Pramit playtests Phase 2.** Checks segmentation performance, mode distinctness, bowl reveal feel, FPS on target machine.
   - If no → fix whatever broke.
   - If yes → proceed to Phase 3.

5. **Pramit sources/generates assets per Part C.** Fruit illustrations (watercolor, locked style), coconut shell, environment video, birds, sound samples. Only now, because mechanics are proven.

6. **Claude Code executes Part B, one pass at a time.** Follows the pass order in Part B to conserve context. Each pass is a fresh session, handling one subsystem, touching only allowed files. Makes creative decisions within the locked design system (typography, palette, motion principles) using its own taste.

7. **Pramit playtests v1.** Reports what feels off.

8. **Claude Code does surgical polish passes** on specific subsystems (trail rendering, particle shapes, bowl composition, etc.). One subsystem per Claude Code session to protect context.

9. **v1 ships.**

10. **v1.5 begins:** shareable bowl, day-to-night progression, achievement garnish.

---

*End of plan. Update as ideation continues.*
