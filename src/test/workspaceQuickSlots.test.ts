import { afterEach, describe, expect, it } from "vitest";
import { clearQuickSlot, readQuickSlots, writeQuickSlot, QUICK_SLOT_COUNT } from "@/lib/workspaceQuickSlots";

const KEY = "ark_workspace_quick_slots_v1";

describe("workspaceQuickSlots", () => {
  afterEach(() => {
    localStorage.removeItem(KEY);
  });

  it("round-trips a slot payload", () => {
    expect(QUICK_SLOT_COUNT).toBe(3);
    const payload = { v: 2, mode: "grid", maxX: 42 };
    expect(writeQuickSlot(1, payload)).toBe(true);
    const slots = readQuickSlots();
    expect(slots[1]).toEqual(payload);
    expect(slots[0]).toBeNull();
  });

  it("clears a slot", () => {
    expect(writeQuickSlot(0, { a: 1 })).toBe(true);
    expect(clearQuickSlot(0)).toBe(true);
    expect(readQuickSlots()[0]).toBeNull();
  });
});
