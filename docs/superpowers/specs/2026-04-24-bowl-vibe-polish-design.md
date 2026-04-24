# bowl — vibe polish design spec
*2026-04-24*

## What this is

A polish pass to close the gap between the plan's intended vibe and the current UI. The problem is not visual weight being too heavy — it's that elements feel timid, disconnected, and lack character. The fix is expressiveness and cohesion, not scale.

Three areas: copy & voice, HUD expressiveness, visual character & cohesion.

---

## Section 1 — Copy & Voice

All copy uses Reenie Beanie. Fraunces is not used. Voice is warm, dry, slightly funny, never instructional. Humor is part of the DNA — lean into it. Cultural references (Southeast Asian fruit world) are grounding, not performative.

### Opening screen
- **Title**: *"raise a finger"*
- **Subtitle**: *"looking at your finger very closely"*

### Calibration / loading screen — sequential slides

Replaces the current static screen. 4 slides auto-advance at ~2.5s each. If loading finishes mid-slide, the current slide completes before transitioning. If loading takes longer than 4 slides, loop from slide 2 onward (not slide 1 — the pitch is seen once).

**Slide 1 — The pitch**
> bowl
> you want fruit. you don't have fruit. you play this.

**Slide 2 — The world**
> summer in the tropics.
> the air smells like pandan and lemongrass.
> the kind of hot where you only want fruit.

**Slide 3 — The durian**
> the durian is the king of fruits.
> it smells extraordinary.
> it is banned on the Singapore MRT.
> you will understand why.

**Slide 4 — Almost ready**
> this is not a game.
> it is a self-care ritual with game mechanics.
> your blade is almost ready.

Slide transitions: cross-fade, 400ms. Text within each slide fades in line by line with 120ms stagger.

### Countdown screen
- **Kicker**: *"king of fruits incoming"* (durian is Raja Buah — King of Fruits in Malay)
- **Subtitle**: *"don't say we didn't warn you"*

### Mode select screen
Button names only. No mood lines underneath. Keep it sparse.

### Idle screen
- **Title**: *"Are you not hungry?"*
- **Subtitle**: *"there is a bowl waiting for you"*

### Game over
- Small caption near score: *"what a bowl"*

### Share sheet
- Title: *"Share your bowl"* (no exclamation mark)

---

## Section 2 — HUD expressiveness

Same element footprint. No new stats. Expressiveness through illustration and animation.

### Durian lives indicator
Replace the number *"3"* with **three small illustrated durian SVG icons** (~24px each, arranged horizontally).

- All three icons display at full opacity when lives are intact.
- When a life is lost: the corresponding icon dims (opacity → 0.22, desaturated) with a brief wobble animation before settling (200ms shake, then settle).
- When a durian is actively in flight on screen: all three icons do a very slow shared pulse (~4s period, scale 1.0 → 1.04 → 1.0) — like they know something is coming.
- The `ui-pill-meta` text *"watch out for them"* remains as supporting copy.

### Score card
- When the score increments: a bloom pulse on the blob background (the blob's filter briefly gains brightness + slight scale, 600ms ease-out). The number itself does not animate — only the background reacts.

### Brand *"bowl"*
- Continuous slow breathing: scale 1.0 → 1.008 → 1.0 over a 5s loop. Barely noticeable. Makes it feel alive rather than static.

### Mode buttons (hover / finger-hover)
- Current state: brightness filter only.
- New state: warm scale (1.02) + slight rotation (1.5°). Feels like the button is being picked up, not just lit up.

---

## Section 3 — Visual character & cohesion

### Paper grain overlay
A subtle noise texture applied across all UI surfaces at ~8–12% opacity. Same grain on score card, mode buttons, game over screen, share sheet. This is the single biggest cohesion mechanism — everything feels like it came from the same physical material.

Implementation: SVG `<feTurbulence>` filter applied as a CSS filter, or a small tiled noise PNG as a `::after` pseudo-element on `.ui-pill-button`, `.ui-scribble-button`, `.ui-score-card`, `.ui-pill-chip`, `.ui-error-card`, `.ui-share-sheet`.

### Color — pandan as actual color (tentative — implement and evaluate)
- Score value: pandan green (`#c5d86d`) rather than coconut brown
- Active/selected mode button: a genuine pandan wash on the blob, not just brightness
- Durian icons: pandan accent ring when all three lives are intact

These are tentative. Evaluate in-context and dial back freely.

### Hibiscus as the one hot moment per screen
- During play: hibiscus reserved for the brief flash moment when a durian appears (flash on durian icons, ~1 frame ease-out)
- Game over: *"what a bowl"* caption in hibiscus
- One per screen, never more

### Motion timing — consistent heartbeat
| Category | Duration |
|---|---|
| Ambient (breathing, pulse) | 4–6s |
| Reactive (score bloom, wobble) | 200–600ms |
| Transitional (screen changes, slide fades) | 360–500ms |

All motion uses `--ui-ease: cubic-bezier(0.2, 0, 0, 1)`. No outliers.

---

## What this does NOT change
- Element sizes (nothing gets bigger)
- New HUD stats or game mechanics
- Fraunces font (not used)
- Core game logic files

---

## Implementation pass order

1. Copy pass — update all text in `index.html`
2. Loading screen slides — add slide logic to `src/states.js` or a new `src/ui-slides.js`
3. Durian lives SVG — create durian icon SVG, update `src/hud.js` to render icons + animation
4. Score bloom + brand breathing — CSS animations in `styles.css`
5. Mode button hover — update hover CSS in `styles.css`
6. Paper grain overlay — add texture to `styles.css`
7. Color pass — update color usage across `styles.css`, evaluate and adjust
