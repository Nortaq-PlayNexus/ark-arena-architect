import { parsePresetsImport } from "@/lib/importSchemas";
import { logger } from "@/lib/logger";

export type PresetMap = Record<string, Record<string, unknown>>;
export type RecentBuild = { name: string; commands: number; time: number };
const PRESETS_KEY = "ark_presets";
const PRESETS_AUTOSAVE_KEY = "ark_presets_autosave";
const PRESETS_AUTOSAVE_AT_KEY = "ark_presets_autosave_at";

function readStorageJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch (err) {
    logger.debug("presetsStorage: JSON parse failed", key, err);
    return null;
  }
}

function readStorageObject(key: string): Record<string, unknown> {
  const parsed = readStorageJson(key);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  return parsed as Record<string, unknown>;
}

export function savePreset(name: string, config: Record<string, unknown>): boolean {
  const presets = readStorageObject(PRESETS_KEY);
  try {
    localStorage.setItem(PRESETS_AUTOSAVE_KEY, JSON.stringify(presets));
    localStorage.setItem(PRESETS_AUTOSAVE_AT_KEY, String(Date.now()));
  } catch (err) {
    logger.warn("presetsStorage: autosave snapshot before save failed", err);
  }
  presets[name] = { ...config, savedAt: Date.now() };
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    return true;
  } catch (err) {
    logger.warn("presetsStorage: savePreset failed", err);
    return false;
  }
}

export function loadPresets(): PresetMap {
  return readStorageObject(PRESETS_KEY) as PresetMap;
}

export function deletePreset(name: string): boolean {
  const presets = readStorageObject(PRESETS_KEY);
  try {
    localStorage.setItem(PRESETS_AUTOSAVE_KEY, JSON.stringify(presets));
    localStorage.setItem(PRESETS_AUTOSAVE_AT_KEY, String(Date.now()));
  } catch (err) {
    logger.warn("presetsStorage: autosave snapshot before delete failed", err);
  }
  delete presets[name];
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    return true;
  } catch (err) {
    logger.warn("presetsStorage: deletePreset failed", err);
    return false;
  }
}

export function exportPresetsFile() {
  const presets = readStorageObject(PRESETS_KEY);
  const payload = {
    exportedAt: new Date().toISOString(),
    presets,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ark-presets-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importPresetsObject(payload: unknown) {
  return parsePresetsImport(payload);
}

export function backupCurrentPresets() {
  const presets = readStorageObject(PRESETS_KEY);
  try {
    localStorage.setItem(PRESETS_AUTOSAVE_KEY, JSON.stringify(presets));
    localStorage.setItem(PRESETS_AUTOSAVE_AT_KEY, String(Date.now()));
  } catch (err) {
    logger.warn("presetsStorage: backupCurrentPresets failed", err);
  }
}

export type RestorePresetsAutosaveResult =
  | { ok: true; presets: PresetMap }
  | { ok: false; reason: "empty" | "persist_failed" };

export function restorePresetsAutosave(): RestorePresetsAutosaveResult {
  const snap = readStorageObject(PRESETS_AUTOSAVE_KEY);
  if (!snap || Object.keys(snap).length === 0) return { ok: false, reason: "empty" };
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(snap));
    return { ok: true, presets: snap as PresetMap };
  } catch (err) {
    logger.warn("presetsStorage: restorePresetsAutosave could not persist", err);
    return { ok: false, reason: "persist_failed" };
  }
}

export function getPresetsAutosaveInfo(): { updatedAt: number | null; count: number } {
  const snap = readStorageObject(PRESETS_AUTOSAVE_KEY);
  const rawTs = localStorage.getItem(PRESETS_AUTOSAVE_AT_KEY);
  const ts = rawTs ? Number(rawTs) : NaN;
  return {
    updatedAt: Number.isFinite(ts) ? ts : null,
    count: Object.keys(snap).length,
  };
}

export function addRecentBuild(shapeName: string, commandCount: number) {
  const raw = readStorageJson("ark_recent");
  const recent = Array.isArray(raw) ? raw : [];
  recent.unshift({ name: shapeName, commands: commandCount, time: Date.now() });
  try {
    localStorage.setItem("ark_recent", JSON.stringify(recent.slice(0, 20)));
  } catch (err) {
    logger.warn("presetsStorage: addRecentBuild failed", err);
  }
}

export function getRecentBuilds(): RecentBuild[] {
  try {
    const raw = localStorage.getItem("ark_recent");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as RecentBuild[];
  } catch (err) {
    logger.debug("presetsStorage: getRecentBuilds parse failed", err);
    return [];
  }
}
