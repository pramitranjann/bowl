export const STATES = {
  OPENING: "opening",
  CALIBRATION: "calibration",
  MODE_SELECT: "mode-select",
  COUNTDOWN: "countdown",
  PLAY: "play",
  IDLE: "idle",
  GAMEOVER: "gameover",
  ERROR: "error",
  LOADING: "loading",
};

export const MODES = {
  ENDLESS: "endless",
  TIMED: "timed",
  SUNSET: "sunset",
};

export const MODE_META = {
  [MODES.ENDLESS]: {
    label: "Endless",
    subtitle: "keep slicing",
  },
  [MODES.TIMED]: {
    label: "Timed",
    subtitle: "90 seconds",
  },
  [MODES.SUNSET]: {
    label: "Sunset",
    subtitle: "slow and long",
  },
};
