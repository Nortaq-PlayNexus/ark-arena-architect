import { logger } from "@/lib/logger";

/** Rem-based UI scale (a11y). Persisted in localStorage. */
export const FONT_SCALE_STEPS = [0.88, 1, 1.12, 1.25] as const;
const FONT_KEY = "ark_ui_font_step";
const COMPACT_KEY = "ark_ui_compact";
const REDUCE_MOTION_KEY = "ark_ui_reduce_motion";
const LINE_NUMBERS_KEY = "ark_ui_cmd_line_numbers";

export type ReduceMotionMode = "system" | "reduce" | "full";

export function readReduceMotionMode(): ReduceMotionMode {
  try {
    const v = localStorage.getItem(REDUCE_MOTION_KEY);
    if (v === "reduce" || v === "full" || v === "system") return v;
  } catch (err) {
    logger.debug("uiPreferences: readReduceMotionMode failed", err);
  }
  return "system";
}

export function writeReduceMotionMode(mode: ReduceMotionMode): void {
  try {
    localStorage.setItem(REDUCE_MOTION_KEY, mode);
  } catch (err) {
    logger.warn("uiPreferences: writeReduceMotionMode failed", err);
  }
}

export function effectiveReduceMotion(mode: ReduceMotionMode, systemPrefersReduce: boolean): boolean {
  if (mode === "reduce") return true;
  if (mode === "full") return false;
  return systemPrefersReduce;
}

export function applyReduceMotionClass(reduceAnimations: boolean): void {
  document.documentElement.classList.toggle("ark-reduce-motion", reduceAnimations);
}

export function readCommandLineNumbers(): boolean {
  try {
    return localStorage.getItem(LINE_NUMBERS_KEY) === "1";
  } catch (err) {
    logger.debug("uiPreferences: readCommandLineNumbers failed", err);
    return false;
  }
}

export function writeCommandLineNumbers(on: boolean): void {
  try {
    localStorage.setItem(LINE_NUMBERS_KEY, on ? "1" : "0");
  } catch (err) {
    logger.warn("uiPreferences: writeCommandLineNumbers failed", err);
  }
}

export function readFontScaleStep(): number {
  try {
    const n = parseInt(localStorage.getItem(FONT_KEY) ?? "1", 10);
    if (n >= 0 && n < FONT_SCALE_STEPS.length) return n;
  } catch (err) {
    logger.debug("uiPreferences: readFontScaleStep failed", err);
  }
  return 1;
}

export function writeFontScaleStep(step: number): void {
  const s = Math.max(0, Math.min(FONT_SCALE_STEPS.length - 1, Math.round(step)));
  try {
    localStorage.setItem(FONT_KEY, String(s));
  } catch (err) {
    logger.warn("uiPreferences: writeFontScaleStep failed", err);
  }
}

export function applyFontScaleStepToDocument(step: number): void {
  const s = Math.max(0, Math.min(FONT_SCALE_STEPS.length - 1, Math.round(step)));
  const mul = FONT_SCALE_STEPS[s]!;
  document.documentElement.style.setProperty("--ark-app-font-scale", String(mul));
}

export function readCompactUi(): boolean {
  try {
    return localStorage.getItem(COMPACT_KEY) === "1";
  } catch (err) {
    logger.debug("uiPreferences: readCompactUi failed", err);
    return false;
  }
}

export function writeCompactUi(on: boolean): void {
  try {
    localStorage.setItem(COMPACT_KEY, on ? "1" : "0");
  } catch (err) {
    logger.warn("uiPreferences: writeCompactUi failed", err);
  }
}
