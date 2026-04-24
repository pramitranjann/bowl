# Bowl Vibe Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the gap between the plan's intended vibe and the current UI — making elements feel expressive, alive, and cohesive without changing their footprint or adding new game mechanics.

**Architecture:** Seven sequential tasks: copy pass, loading-screen slide carousel, illustrated durian lives on canvas, score bloom + brand breathing, mode button hover, paper grain overlay, and a tentative colour pass. The slide carousel self-initialises via MutationObserver on `#ui-root[data-scene]` so it requires no changes to the locked `states.js` or `main.js`. The durian lives upgrade modifies only the render path in `hud.js`. All other changes are CSS-only.

**Tech Stack:** Vanilla JS (ES modules), HTML5 Canvas 2D, CSS3 keyframe animations, SVG, no build tools.

---

### Task 1: Copy pass

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Opening screen title**

In `index.html`, find the opening section and change:
```html
<h1 class="ui-title">Hold your finger up</h1>
```
to:
```html
<h1 class="ui-title">raise a finger</h1>
```

- [ ] **Step 2: Countdown copy**

Find the countdown section and change:
```html
<p class="ui-countdown-kicker">watch for durian</p>
```
to:
```html
<p class="ui-countdown-kicker">king of fruits incoming</p>
```

And change:
```html
<p class="ui-subtitle">slice clean, keep your hands light</p>
```
to:
```html
<p class="ui-subtitle">don't say we didn't warn you</p>
```

- [ ] **Step 3: Idle subtitle**

Find the idle section and change:
```html
<p class="ui-subtitle">what else could you be doing other than making a bowl fruits</p>
```
to:
```html
<p class="ui-subtitle">there is a bowl waiting for you</p>
```

- [ ] **Step 4: Game over caption**

In the `#gameover-actions` section, add a caption paragraph as the first child:
```html
<section id="gameover-actions" aria-live="polite" hidden>
  <p class="ui-gameover-caption">what a bowl</p>
  <button id="ui-gameover-restart" class="ui-scribble-button hand-target" type="button">
    Again
  </button>
  <button id="ui-gameover-share" class="ui-scribble-button hand-target" type="button">
    Share
  </button>
</section>
```

- [ ] **Step 5: Share sheet title**

Change:
```html
<h2 class="ui-share-title">Share your bowl!</h2>
```
to:
```html
<h2 class="ui-share-title">Share your bowl</h2>
```

- [ ] **Step 6: Mode-worlds button default text**

Find the `id="mode-worlds"` button and change its text content from `Modes` to `Worlds`:
```html
<button
  id="mode-worlds"
  class="ui-scribble-button hand-target"
  type="button"
>
  Worlds
</button>
```

- [ ] **Step 7: Style the gameover caption**

In `styles.css`, add after the `#gameover-actions` block:
```css
.ui-gameover-caption {
  position: absolute;
  left: 50%;
  bottom: calc(max(132px, env(safe-area-inset-bottom) + 86px) + 116px);
  transform: translateX(-50%);
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 2.4vw, 2.6rem);
  line-height: 1;
  color: var(--color-hibiscus);
  white-space: nowrap;
  pointer-events: none;
}
```

Also add it to the gameover actions stagger animation block:
```css
#gameover-actions:not([hidden]) .ui-gameover-caption { animation: ui-enter 360ms var(--ui-ease) 20ms both; }
```

- [ ] **Step 8: Verify and commit**

Open the game and navigate each screen. Confirm:
- Opening: "raise a finger"
- Countdown kicker: "king of fruits incoming"
- Countdown subtitle: "don't say we didn't warn you"
- Idle subtitle: "there is a bowl waiting for you"
- Game over: hibiscus "what a bowl" caption above the action buttons
- Share sheet title: "Share your bowl" (no exclamation)

```bash
git add index.html styles.css
git commit -m "copy: vibe polish pass — opening, countdown, idle, gameover, share"
```

---

### Task 2: Loading screen sequential slides

**Files:**
- Modify: `index.html`
- Create: `src/ui-slides.js`
- Modify: `styles.css`

**Background:** `states.js` updates `#ui-status-line` and `#ui-status-detail` during loading. Those elements are kept in the DOM but visually hidden so `states.js` continues working without modification. The slide carousel self-initialises by watching `#ui-root[data-scene]` via MutationObserver.

- [ ] **Step 1: Restructure calibration section in index.html**

Replace the entire `#screen-calibration` section with:
```html
<section id="screen-calibration" class="ui-screen ui-screen--calibration" aria-live="polite">
  <div id="calibration-slide-stage" class="calibration-slide-stage">
    <div id="calibration-slide-content" class="calibration-slide-content"></div>
  </div>
  <!-- Status elements preserved for states.js — not visible to user -->
  <div aria-hidden="true" style="position:absolute;opacity:0;pointer-events:none">
    <div class="ui-brand-lockup">bowl</div>
    <p id="ui-status-line" class="ui-status-line">sharpening your blade....</p>
    <p id="ui-status-detail" class="ui-status-detail"></p>
  </div>
</section>
```

- [ ] **Step 2: Add slide CSS to styles.css**

Add after the existing `.ui-screen--calibration` rules:
```css
.calibration-slide-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.calibration-slide-content {
  display: grid;
  justify-items: center;
  gap: 14px;
  text-align: center;
  max-width: min(560px, 80vw);
}

.calibration-slide-line {
  display: block;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 2.8vw, 3rem);
  line-height: 1;
  color: var(--color-coconut-brown);
  animation: ui-enter 360ms var(--ui-ease) both;
}

.calibration-slide-line--hero {
  font-size: clamp(3.4rem, 6vw, 5.5rem);
}

@keyframes slide-fade-out {
  from { opacity: 1; transform: none; filter: blur(0); }
  to { opacity: 0; transform: translateY(-8px); filter: blur(3px); }
}

.calibration-slide-content.is-leaving {
  animation: slide-fade-out 380ms var(--ui-ease) both;
}
```

- [ ] **Step 3: Create src/ui-slides.js**

```js
// Self-initialising slide carousel for the loading/calibration screen.
// Watches #ui-root[data-scene] via MutationObserver — no changes to states.js or main.js required.

const SLIDES = [
  {
    lines: [
      { text: 'bowl', hero: true },
      { text: "you want fruit. you don't have fruit. you play this." },
    ],
  },
  {
    lines: [
      { text: 'summer in the tropics.' },
      { text: 'the air smells like pandan and lemongrass.' },
      { text: 'the kind of hot where you only want fruit.' },
    ],
  },
  {
    lines: [
      { text: 'the durian is the king of fruits.' },
      { text: 'it smells extraordinary.' },
      { text: 'it is banned on the Singapore MRT.' },
      { text: 'you will understand why.' },
    ],
  },
  {
    lines: [
      { text: 'this is not a game.' },
      { text: 'it is a self-care ritual with game mechanics.' },
      { text: 'your blade is almost ready.' },
    ],
  },
];

const SLIDE_DURATION_MS = 2500;
const FADE_OUT_MS = 380;
const ACTIVE_SCENES = new Set(['loading', 'calibration']);

let slideIndex = 0;
let slideTimer = null;
let isRunning = false;

function renderSlide(index) {
  const container = document.getElementById('calibration-slide-content');
  if (!container) return;
  container.classList.remove('is-leaving');
  void container.offsetWidth; // force reflow so animation restarts
  container.innerHTML = SLIDES[index].lines
    .map(
      (line, i) =>
        `<span class="calibration-slide-line${line.hero ? ' calibration-slide-line--hero' : ''}" style="animation-delay:${i * 120}ms">${line.text}</span>`
    )
    .join('');
}

function advanceSlide() {
  if (!isRunning) return;
  const container = document.getElementById('calibration-slide-content');
  if (container) container.classList.add('is-leaving');

  setTimeout(() => {
    if (!isRunning) return;
    // Slide 0 (pitch) is shown once. After that, cycle 1→2→3→1→2→3...
    if (slideIndex === 0) {
      slideIndex = 1;
    } else {
      slideIndex = slideIndex < SLIDES.length - 1 ? slideIndex + 1 : 1;
    }
    renderSlide(slideIndex);
    slideTimer = setTimeout(advanceSlide, SLIDE_DURATION_MS);
  }, FADE_OUT_MS);
}

function startSlides() {
  if (isRunning) return;
  isRunning = true;
  slideIndex = 0;
  renderSlide(0);
  slideTimer = setTimeout(advanceSlide, SLIDE_DURATION_MS);
}

function stopSlides() {
  if (!isRunning) return;
  isRunning = false;
  clearTimeout(slideTimer);
  slideTimer = null;
}

function init() {
  const uiRoot = document.getElementById('ui-root');
  if (!uiRoot) return;

  const observer = new MutationObserver(() => {
    if (ACTIVE_SCENES.has(uiRoot.dataset.scene)) {
      startSlides();
    } else {
      stopSlides();
    }
  });

  observer.observe(uiRoot, { attributes: true, attributeFilter: ['data-scene'] });

  // Handle the case where the scene is already active on init
  if (ACTIVE_SCENES.has(uiRoot.dataset.scene)) startSlides();
}

document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Step 4: Import ui-slides.js in index.html**

Add before the closing `</body>` tag, after the existing `<script>` tag:
```html
<script type="module" src="./src/ui-slides.js"></script>
```

- [ ] **Step 5: Verify and commit**

Open the game. On the loading/calibration screen, verify:
- Slide 1 shows large "bowl" + pitch line, lines fade in sequentially
- After ~2.5s, content fades out and slide 2 appears (tropical world)
- After ~2.5s, slide 3 appears (durian fact)
- After ~2.5s, slide 4 appears ("your blade is almost ready")
- If still loading, slide 2 reappears (not slide 1 again)
- When loading completes and scene changes, slides stop cleanly

```bash
git add index.html styles.css src/ui-slides.js
git commit -m "feat: sequential loading slides with cultural context and humor"
```

---

### Task 3: Illustrated durian lives on canvas

**Files:**
- Modify: `src/hud.js`

**Background:** `renderHud` in `hud.js` draws three dots for durian lives (lines 108–119). The `livesLost` parameter is already passed in. We replace the dots with a small drawn durian icon shape. No game logic is touched.

- [ ] **Step 1: Add drawDurianIcon helper to hud.js**

Add this function immediately after `drawPaperSwash` (before `renderHud`):

```js
function drawDurianIcon(ctx, cx, cy, size, active) {
  ctx.save();
  ctx.globalAlpha = active ? 1.0 : 0.22;
  ctx.fillStyle = active ? HUD_COLORS.pandan : HUD_COLORS.muted;

  // Body oval
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.06, size * 0.38, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spikes: [tipX, tipY, base1X, base1Y, base2X, base2Y] as multiples of size
  const spikes = [
    [0, -0.5, -0.12, -0.16, 0.12, -0.16],
    [0.48, -0.3, 0.16, -0.06, 0.34, 0.14],
    [0.46, 0.24, 0.12, 0.1, 0.26, 0.36],
    [-0.46, 0.24, -0.12, 0.1, -0.26, 0.36],
    [-0.48, -0.3, -0.16, -0.06, -0.34, 0.14],
  ];

  for (const [tx, ty, b1x, b1y, b2x, b2y] of spikes) {
    ctx.beginPath();
    ctx.moveTo(cx + tx * size, cy + ty * size);
    ctx.lineTo(cx + b1x * size, cy + b1y * size);
    ctx.lineTo(cx + b2x * size, cy + b2y * size);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}
```

- [ ] **Step 2: Replace dot rendering with icon rendering**

In `renderHud`, find the dot loop (currently ~lines 108–119):
```js
const dotSpacing = 18;
const totalDotsWidth = dotSpacing * (CONFIG.maxDurianHits - 1);
const dotsStartX = livesRect.x + livesRect.width / 2 - totalDotsWidth / 2;
const dotsY = livesRect.y + 30;

for (let index = 0; index < CONFIG.maxDurianHits; index += 1) {
  const active = index < CONFIG.maxDurianHits - livesLost;
  ctx.beginPath();
  ctx.fillStyle = active ? HUD_COLORS.pandan : HUD_COLORS.muted;
  ctx.arc(dotsStartX + index * dotSpacing, dotsY, 6, 0, Math.PI * 2);
  ctx.fill();
}
```

Replace with:
```js
const iconSize = 20;
const iconSpacing = 30;
const totalIconsWidth = iconSpacing * (CONFIG.maxDurianHits - 1);
const iconsStartX = livesRect.x + livesRect.width / 2 - totalIconsWidth / 2;
const iconsY = livesRect.y + 32;

for (let index = 0; index < CONFIG.maxDurianHits; index += 1) {
  const active = index < CONFIG.maxDurianHits - livesLost;
  drawDurianIcon(ctx, iconsStartX + index * iconSpacing, iconsY, iconSize, active);
}
```

- [ ] **Step 3: Verify and commit**

Play a game in endless mode. Verify:
- Three small durian-shaped icons replace the dots in the lives area
- Icons are pandan green when lives are intact
- Each icon dims (low opacity, desaturated) as a life is lost
- The layout still fits within `livesRect` — adjust `iconSize` or `iconSpacing` if icons overflow

```bash
git add src/hud.js
git commit -m "feat: illustrated durian icons replace dots in lives indicator"
```

---

### Task 4: Score bloom + brand breathing

**Files:**
- Modify: `styles.css`
- Modify: `src/hud.js`

- [ ] **Step 1: Brand breathing — CSS animation**

In `styles.css`, add a keyframe and apply it to `.ui-brand`. Add to the end of the file (before the Enter animations block, or after it):
```css
@keyframes brand-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.008); }
}
```

Then in the existing `.ui-brand` rule, add the animation:
```css
animation: brand-breathe 5s ease-in-out infinite;
```

The existing `transition: transform ...` will coexist — `transition` only applies on state changes (hover), while `animation` runs continuously.

- [ ] **Step 2: Score bloom — CSS animation**

Add to `styles.css`:
```css
@keyframes score-bloom {
  0% { filter: none; }
  30% { filter: brightness(1.2) saturate(1.1); }
  100% { filter: none; }
}

.ui-score-card.is-blooming::before {
  animation: score-bloom 600ms var(--ui-ease) both;
}
```

- [ ] **Step 3: Score bloom — canvas glow + HTML card trigger in hud.js**

At the top of `hud.js`, add a module-level variable after `HUD_COLORS`:
```js
let _lastScore = undefined;
let _scoreBloomUntil = 0;
```

At the start of `renderHud`, add score-change detection (insert before `ctx.save()`):
```js
if (score !== _lastScore && _lastScore !== undefined) {
  _scoreBloomUntil = performance.now() + 600;
  const card = document.querySelector('.ui-score-card');
  if (card) {
    card.classList.remove('is-blooming');
    void card.offsetWidth;
    card.classList.add('is-blooming');
    card.addEventListener('animationend', () => card.classList.remove('is-blooming'), { once: true });
  }
}
_lastScore = score;
```

Then modify the canvas score number draw to apply a glow when blooming. Find these lines:
```js
ctx.fillStyle = HUD_COLORS.ink;
ctx.font = '400 70px "Reenie Beanie", cursive';
ctx.fillText(`${score}`, scoreX, scoreY + 12);
```

Replace with:
```js
const blooming = performance.now() < _scoreBloomUntil;
if (blooming) {
  ctx.save();
  ctx.shadowColor = HUD_COLORS.pandan;
  ctx.shadowBlur = 16;
}
ctx.fillStyle = HUD_COLORS.ink;
ctx.font = '400 70px "Reenie Beanie", cursive';
ctx.fillText(`${score}`, scoreX, scoreY + 12);
if (blooming) ctx.restore();
```

- [ ] **Step 4: Verify and commit**

Open the game and check:
- The "bowl" brand logo slowly and subtly breathes (scale 1.0 ↔ 1.008 over 5s — barely visible, just alive)
- When a fruit is sliced and the score increments, a brief warm pandan glow appears on the canvas score, and the HTML score card (if visible) blooms

```bash
git add styles.css src/hud.js
git commit -m "feat: brand breathing + score bloom pulse on increment"
```

---

### Task 5: Mode button hover upgrade

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Update scribble button hover state**

Find the rule for `.ui-scribble-button:hover` and `.ui-scribble-button.is-finger-hovered`. The existing hover is inherited from a shared rule using only `filter: brightness(...)`. Add a specific override for scribble buttons:

```css
.ui-scribble-button:hover,
.ui-scribble-button.is-finger-hovered {
  transform: scale(1.02) rotate(1.5deg);
  filter: brightness(1.06);
}
```

If a `transform` is already on `.ui-scribble-button` for the `--finger-progress` interaction, make sure this override doesn't conflict. The `--finger-progress` variable will be 0–1 only when hand tracking is active; for mouse hover, it remains 0.

- [ ] **Step 2: Verify and commit**

Open mode select. Hover mouse over the three mode buttons. Verify a subtle scale + slight tilt gives a "picked up" feel without being distracting. The rotation should be gentle — not a dramatic lean.

```bash
git add styles.css
git commit -m "style: mode button hover — scale + rotation instead of brightness only"
```

---

### Task 6: Paper grain overlay

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Add hidden SVG noise filter to index.html**

Add inside `<head>`, before `</head>`:
```html
<svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">
  <defs>
    <filter id="ui-grain" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="grey"/>
      <feBlend in="SourceGraphic" in2="grey" mode="overlay"/>
    </filter>
  </defs>
</svg>
```

- [ ] **Step 2: Apply grain via ::after to UI surfaces**

The `::before` pseudo-element is already used by these classes for the blob SVG backgrounds. Use `::after` for grain. Add to `styles.css`:

```css
/* Paper grain — unifies all UI blob surfaces into the same material */
.ui-pill-button::after,
.ui-scribble-button::after,
.ui-score-card::after,
.ui-pill-chip::after,
.ui-error-card::after,
.ui-share-sheet::after,
.ui-action-swatch::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0.09;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
  background-repeat: repeat;
}
```

Make sure these elements have `isolation: isolate` set (check the existing rules — `.ui-pill-button`, `.ui-scribble-button`, `.ui-icon-button` already have `isolation: isolate`). If any do not, add `isolation: isolate` to their rules.

- [ ] **Step 3: Tune opacity in context**

Open the game and view several screens. The grain should be:
- Noticeable when you look closely at a button surface
- Invisible when you're focused on the game

Adjust the `opacity` value between `0.06` and `0.12` until it reads correctly. If `mix-blend-mode: overlay` creates harsh contrast in some scenarios, try `mix-blend-mode: multiply` instead.

- [ ] **Step 4: Verify and commit**

```bash
git add index.html styles.css
git commit -m "style: paper grain overlay for UI surface cohesion"
```

---

### Task 7: Colour pass (tentative — evaluate in context)

**Files:**
- Modify: `styles.css`

**This task is explicitly tentative.** Apply each change, check how it reads in the game, and revert individual items if they don't work. The goal is to test whether bolder colour use increases expressiveness. Do not force anything that looks wrong.

- [ ] **Step 1: Score value — pandan green**

Find `.ui-score-value` in `styles.css` and change:
```css
color: var(--color-ink-deep);
```
to:
```css
color: var(--color-pandan);
```

Open the game and check: does the pandan score value read well against the pandan blob background on the score card? If they're too similar (pandan on pandan), revert this step.

- [ ] **Step 2: Active mode button pandan wash**

Add to `styles.css`:
```css
#screen-mode-select .ui-scribble-button.is-active {
  filter: drop-shadow(0 18px 30px rgba(42, 31, 24, 0.16)) saturate(1.2) brightness(1.08);
}
```

Check: does the selected/active mode button read as clearly chosen? If it's too subtle, try increasing `saturate` to `1.3`. If it creates visual noise, revert.

- [ ] **Step 3: Commit whatever passes**

Commit only the colour changes that looked good after evaluation:

```bash
git add styles.css
git commit -m "style: tentative colour pass — pandan score, active mode state"
```

If both were reverted, skip the commit.
