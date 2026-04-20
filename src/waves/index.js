import { ENDLESS_WAVES } from "./endless.js";
import { TIMED_WAVES } from "./timed.js";
import { SUNSET_WAVES } from "./sunset.js";
import { MODES } from "../states.js";

export const WAVES_BY_MODE = {
  [MODES.ENDLESS]: ENDLESS_WAVES,
  [MODES.TIMED]: TIMED_WAVES,
  [MODES.SUNSET]: SUNSET_WAVES,
};
