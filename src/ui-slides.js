// Loading / calibration screen: "bowl" stays pinned as hero; a support line cycles below it.
const SUPPORT_LINES = [
  "you want fruit. you don't have fruit. you play this.",
  "the kind of hot where you only want fruit.",
  "the durian is the king of fruits. you will understand why.",
  "your blade is almost ready.",
];

const CYCLE_MS = 2800;
const FADE_MS = 320;
const ACTIVE_SCENES = new Set(['loading', 'calibration']);

let supportIndex = 0;
let cycleTimer = null;
let isRunning = false;

function getContainer() {
  return document.getElementById('calibration-slide-content');
}

function initContent() {
  const c = getContainer();
  if (!c) return;
  if (c.querySelector('.calibration-slide-line--hero')) return;
  c.innerHTML =
    '<span class="calibration-slide-line calibration-slide-line--hero">bowl</span>' +
    `<span class="calibration-slide-line calibration-slide-support">${SUPPORT_LINES[0]}</span>`;
}

function cycleSupport() {
  if (!isRunning) return;
  const c = getContainer();
  const el = c?.querySelector('.calibration-slide-support');
  if (!el) return;

  el.style.transition = `opacity ${FADE_MS}ms ease, filter ${FADE_MS}ms ease`;
  el.style.opacity = '0';
  el.style.filter = 'blur(3px)';

  cycleTimer = setTimeout(() => {
    if (!isRunning) return;
    supportIndex = (supportIndex + 1) % SUPPORT_LINES.length;
    el.textContent = SUPPORT_LINES[supportIndex];
    el.style.opacity = '1';
    el.style.filter = 'none';
    cycleTimer = setTimeout(cycleSupport, CYCLE_MS);
  }, FADE_MS);
}

function start() {
  if (isRunning) return;
  isRunning = true;
  supportIndex = 0;
  initContent();
  cycleTimer = setTimeout(cycleSupport, CYCLE_MS);
}

function stop() {
  isRunning = false;
  clearTimeout(cycleTimer);
  cycleTimer = null;
}

function init() {
  const uiRoot = document.getElementById('ui-root');
  if (!uiRoot) return;

  const observer = new MutationObserver(() => {
    if (ACTIVE_SCENES.has(uiRoot.dataset.scene)) {
      start();
    } else {
      stop();
    }
  });

  observer.observe(uiRoot, { attributes: true, attributeFilter: ['data-scene'] });
  if (ACTIVE_SCENES.has(uiRoot.dataset.scene)) start();
}

document.addEventListener('DOMContentLoaded', init);
