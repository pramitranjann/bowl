function formatValue(value, step) {
  if (step >= 1) {
    return `${Math.round(value)}`;
  }
  if (step >= 0.1) {
    return value.toFixed(1);
  }
  return value.toFixed(2);
}

export function createDevPanel({
  config,
  game,
  tracker,
  getMetrics,
  onRestart,
  onToggleLite,
}) {
  const toggle = document.getElementById("dev-toggle");
  const panel = document.getElementById("dev-panel");
  const devEnabled = new URLSearchParams(window.location.search).has("dev");

  if (!devEnabled) {
    toggle.hidden = true;
    panel.hidden = true;
    return {
      update() {},
    };
  }

  const controls = [
    {
      key: "sliceVelocityThreshold",
      label: "Slice Threshold",
      min: 250,
      max: 1200,
      step: 10,
      section: "Input",
    },
    {
      key: "handSmoothing",
      label: "Hand Smoothing",
      min: 0.1,
      max: 0.55,
      step: 0.01,
      section: "Input",
    },
    {
      key: "minHandConfidence",
      label: "Hand Confidence",
      min: 0.2,
      max: 0.8,
      step: 0.01,
      section: "Input",
      onChange: (value) => tracker.setMinConfidence(value),
    },
    {
      key: "gravity",
      label: "Gravity",
      min: 500,
      max: 1500,
      step: 10,
      section: "Physics",
    },
    {
      key: "fruitBaseSize",
      label: "Fruit Size",
      min: 80,
      max: 180,
      step: 2,
      section: "Physics",
    },
    {
      key: "spawnDelayMultiplier",
      label: "Spawn Delay",
      min: 0.5,
      max: 2.2,
      step: 0.05,
      section: "Pacing",
    },
    {
      key: "waveDelayMultiplier",
      label: "Wave Pause",
      min: 0.4,
      max: 2.2,
      step: 0.05,
      section: "Pacing",
    },
    {
      key: "particleBaseCount",
      label: "Particles",
      min: 4,
      max: 32,
      step: 1,
      section: "Effects",
    },
  ];

  const sections = new Map();
  const valueNodes = new Map();
  const statNodes = new Map();
  let visible = false;

  panel.innerHTML = `
    <div class="dev-panel__header">
      <div>
        <h2 class="dev-panel__title">Mechanics Tuning</h2>
        <p class="dev-panel__hint">Hidden dev overlay for Phase 2 playtests.</p>
      </div>
    </div>
  `;

  for (const control of controls) {
    if (!sections.has(control.section)) {
      const sectionNode = document.createElement("section");
      sectionNode.className = "dev-panel__section";
      sectionNode.innerHTML = `<h3 class="dev-panel__section-title">${control.section}</h3>`;
      panel.appendChild(sectionNode);
      sections.set(control.section, sectionNode);
    }

    const row = document.createElement("label");
    row.className = "dev-panel__control";
    const valueText = formatValue(config[control.key], control.step);
    row.innerHTML = `
      <div class="dev-panel__control-row">
        <span class="dev-panel__label">${control.label}</span>
        <span class="dev-panel__value" data-value-for="${control.key}">${valueText}</span>
      </div>
      <input
        class="dev-panel__slider"
        type="range"
        min="${control.min}"
        max="${control.max}"
        step="${control.step}"
        value="${config[control.key]}"
      >
    `;

    const input = row.querySelector("input");
    const valueNode = row.querySelector(`[data-value-for="${control.key}"]`);
    valueNodes.set(control.key, valueNode);

    input.addEventListener("input", async (event) => {
      const value = Number(event.currentTarget.value);
      config[control.key] = value;
      valueNode.textContent = formatValue(value, control.step);
      if (control.onChange) {
        await control.onChange(value);
      }
    });

    sections.get(control.section).appendChild(row);
  }

  const statsSection = document.createElement("section");
  statsSection.className = "dev-panel__section";
  statsSection.innerHTML = `
    <h3 class="dev-panel__section-title">Runtime</h3>
    <div class="dev-panel__stats">
      <div class="dev-panel__stat"><span class="dev-panel__stat-label">State</span><span class="dev-panel__stat-value" data-stat="state">-</span></div>
      <div class="dev-panel__stat"><span class="dev-panel__stat-label">FPS</span><span class="dev-panel__stat-value" data-stat="fps">-</span></div>
      <div class="dev-panel__stat"><span class="dev-panel__stat-label">Hands</span><span class="dev-panel__stat-value" data-stat="hands">-</span></div>
      <div class="dev-panel__stat"><span class="dev-panel__stat-label">Entities</span><span class="dev-panel__stat-value" data-stat="entities">-</span></div>
      <div class="dev-panel__stat"><span class="dev-panel__stat-label">Particles</span><span class="dev-panel__stat-value" data-stat="particles">-</span></div>
      <div class="dev-panel__stat"><span class="dev-panel__stat-label">Score</span><span class="dev-panel__stat-value" data-stat="score">-</span></div>
    </div>
  `;
  panel.appendChild(statsSection);

  for (const node of statsSection.querySelectorAll("[data-stat]")) {
    statNodes.set(node.dataset.stat, node);
  }

  const actions = document.createElement("section");
  actions.className = "dev-panel__section";
  actions.innerHTML = `
    <h3 class="dev-panel__section-title">Actions</h3>
    <div class="dev-panel__actions">
      <button class="dev-panel__button" type="button" data-action="restart">Restart Round</button>
      <button class="dev-panel__button" type="button" data-action="reset">Reset Tuners</button>
      <button class="dev-panel__button" type="button" data-action="lite">Lite Auto</button>
    </div>
  `;
  panel.appendChild(actions);

  actions
    .querySelector('[data-action="restart"]')
    .addEventListener("click", () => onRestart());

  actions
    .querySelector('[data-action="reset"]')
    .addEventListener("click", async () => {
      location.reload();
    });

  const liteButton = actions.querySelector('[data-action="lite"]');
  liteButton.addEventListener("click", () => onToggleLite());

  function setVisible(nextVisible) {
    visible = nextVisible;
    panel.hidden = !visible;
    toggle.setAttribute("aria-expanded", String(visible));
  }

  toggle.addEventListener("click", () => setVisible(!visible));
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "d") {
      setVisible(!visible);
    }
  });

  function update() {
    const metrics = getMetrics();
    statNodes.get("state").textContent = game.state;
    statNodes.get("fps").textContent = `${metrics.fps}`;
    statNodes.get("hands").textContent = `${tracker.stats.handsDetected}`;
    statNodes.get("entities").textContent = `${metrics.entities}`;
    statNodes.get("particles").textContent = `${metrics.particles}`;
    statNodes.get("score").textContent = `${game.score}`;
    liteButton.textContent = game.forceLiteMode ? "Lite Forced" : "Lite Auto";
  }

  return {
    update,
  };
}
