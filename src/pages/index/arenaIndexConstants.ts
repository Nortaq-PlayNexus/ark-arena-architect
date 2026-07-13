import { SHAPE_PRESETS } from "@/lib/shapeGenerators";

export const DEFAULT_BLUEPRINT =
  '"Blueprint\'/Game/PrimalEarth/Structures/TributeTerminal_Base.TributeTerminal_Base\'"';

export type Mode = "grid" | "shape" | "caves";

export type WorkspaceTab = "design" | "placement" | "export";

/** spawnactor: offsets after blueprint. summon: cheat Summon class id, no X/Y/Z (multi-line builds stack). */
export type CommandOutputStyle = "spawnactor" | "summon";

export type SpawnAnchorChoice =
  | "manual"
  | "teleportCorner"
  | "teleportCenter"
  | "teleportFace"
  | "localLayout"
  | "playerRelative";

export const SPAWN_ANCHOR_OPTIONS: { value: SpawnAnchorChoice; label: string; hint: string }[] = [
  { value: "playerRelative", label: "In front of me (relative)", hint: "Paste anywhere — no map coords" },
  { value: "teleportFace", label: "World face (needs teleport)", hint: "Aim with yaw + forward; uses TP feet" },
  { value: "teleportCorner", label: "Corner at my feet", hint: "Build from TP X/Y as corner" },
  { value: "teleportCenter", label: "Center on my teleport", hint: "Footprint centered on TP" },
  { value: "manual", label: "Manual origin", hint: "Use Origin X/Y/Z fields" },
  { value: "localLayout", label: "Local layout (raw coords)", hint: "Absolute world X Y Z in file" },
];

export const MAX_PRESET_IMPORT_BYTES = 2 * 1024 * 1024;

export const TELEPORT_STORAGE_KEY = "ark_tribute_last_teleport";

/** Feet position from last session — ARK cannot read this from the game; user pastes once per machine. */
export function loadStoredTeleport(): { x: number; y: number; z: number } {
  try {
    const raw = localStorage.getItem(TELEPORT_STORAGE_KEY);
    if (!raw) return { x: 0, y: 0, z: 0 };
    const p = JSON.parse(raw) as { x?: number; y?: number; z?: number };
    const x = Number(p.x);
    const y = Number(p.y);
    const z = Number(p.z);
    if (![x, y, z].every((n) => Number.isFinite(n))) return { x: 0, y: 0, z: 0 };
    return { x, y, z };
  } catch {
    return { x: 0, y: 0, z: 0 };
  }
}

export const CHUNK_PRESETS = [110, 160, 210, 310, 410];

/** Local X sample points 0 … maxX; reverse so the first pasted commands sit at the +X end (avoids “starting” at the far −X side when yaw = 0). */
export function xStops(maxX: number, xStep: number, order: "lowFirst" | "highFirst"): number[] {
  const xs: number[] = [];
  for (let x = 0; x <= maxX; x += xStep) xs.push(x);
  return order === "highFirst" ? [...xs].reverse() : xs;
}

export function defaultFaceForward(): number {
  return Math.max(8000, Math.round(SHAPE_PRESETS[0].radius * 0.5));
}
