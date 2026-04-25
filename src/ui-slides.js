// Loading / calibration screen: always shows "bowl" as the persistent hero.
const ACTIVE_SCENES = new Set(['loading', 'calibration']);

function render() {
  const container = document.getElementById('calibration-slide-content');
  if (!container || container.childElementCount > 0) return;
  container.innerHTML =
    '<span class="calibration-slide-line calibration-slide-line--hero">bowl</span>';
}

function init() {
  const uiRoot = document.getElementById('ui-root');
  if (!uiRoot) return;

  const observer = new MutationObserver(() => {
    if (ACTIVE_SCENES.has(uiRoot.dataset.scene)) render();
  });

  observer.observe(uiRoot, { attributes: true, attributeFilter: ['data-scene'] });
  if (ACTIVE_SCENES.has(uiRoot.dataset.scene)) render();
}

document.addEventListener('DOMContentLoaded', init);
