import { logger } from "@/lib/logger";

const KEY = "ark_workspace_quick_slots_v1";
const SLOT_COUNT = 3;

type Store = { slots: Array<Record<string, unknown> | null> };

function parse(raw: string | null): Store {
  if (!raw) return { slots: Array.from({ length: SLOT_COUNT }, () => null) };
  try {
    const o = JSON.parse(raw) as { slots?: unknown };
    const slots = Array.isArray(o.slots) ? o.slots : [];
    const out: Array<Record<string, unknown> | null> = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
      const v = slots[i];
      if (v && typeof v === "object" && !Array.isArray(v)) out.push(v as Record<string, unknown>);
      else out.push(null);
    }
    return { slots: out };
  } catch {
    return { slots: Array.from({ length: SLOT_COUNT }, () => null) };
  }
}

export function readQuickSlots(): Array<Record<string, unknown> | null> {
  try {
    return parse(localStorage.getItem(KEY)).slots;
  } catch {
    return Array.from({ length: SLOT_COUNT }, () => null);
  }
}

export function writeQuickSlot(index: number, payload: Record<string, unknown>): boolean {
  if (index < 0 || index >= SLOT_COUNT) return false;
  const slots = readQuickSlots();
  slots[index] = payload;
  try {
    localStorage.setItem(KEY, JSON.stringify({ slots }));
    return true;
  } catch (err) {
    logger.warn("workspaceQuickSlots: writeQuickSlot failed", err);
    return false;
  }
}

export function clearQuickSlot(index: number): boolean {
  if (index < 0 || index >= SLOT_COUNT) return false;
  const slots = readQuickSlots();
  slots[index] = null;
  try {
    localStorage.setItem(KEY, JSON.stringify({ slots }));
    return true;
  } catch (err) {
    logger.warn("workspaceQuickSlots: clearQuickSlot failed", err);
    return false;
  }
}

export const QUICK_SLOT_COUNT = SLOT_COUNT;
