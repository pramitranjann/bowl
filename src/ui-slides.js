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
  void container.offsetWidth;
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

  if (ACTIVE_SCENES.has(uiRoot.dataset.scene)) startSlides();
}

document.addEventListener('DOMContentLoaded', init);
