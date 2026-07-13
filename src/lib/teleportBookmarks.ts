import { logger } from "@/lib/logger";

const STORAGE_KEY = "ark_arena_tp_bookmarks_v1";
export const MAX_TELEPORT_BOOKMARKS = 8;

export type TeleportBookmark = {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
};

function isBookmark(v: unknown): v is TeleportBookmark {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.label === "string" &&
    typeof o.x === "number" &&
    typeof o.y === "number" &&
    typeof o.z === "number" &&
    Number.isFinite(o.x) &&
    Number.isFinite(o.y) &&
    Number.isFinite(o.z)
  );
}

export function loadTeleportBookmarks(): TeleportBookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isBookmark);
  } catch {
    return [];
  }
}

export function saveTeleportBookmarks(bookmarks: TeleportBookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks.slice(0, MAX_TELEPORT_BOOKMARKS)));
  } catch (err) {
    logger.warn("teleportBookmarks: saveTeleportBookmarks failed", err);
  }
}

export function formatTeleportLine(x: number, y: number, z: number): string {
  return `admincheat SetPlayerPos ${Math.round(x)} ${Math.round(y)} ${Math.round(z)}`;
}
