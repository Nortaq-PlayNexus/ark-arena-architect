/**
 * Debounced persistence of the workspace snapshot in sessionStorage (survives refresh, clears when the tab closes).
 */

import { ARENA_WORKSPACE_PAYLOAD_VERSION } from "@/lib/arenaWorkspacePayload";

export const WORKSPACE_SESSION_STORAGE_KEY = "ark_workspace_session_v2";

/** Avoid double-restore in React 18 Strict Mode (dev) remounts. */
let sessionHydrationConsumed = false;

export function consumeWorkspaceSessionHydrationOnce(): boolean {
  if (sessionHydrationConsumed) return false;
  sessionHydrationConsumed = true;
  return true;
}

export function parseWorkspaceSessionPayload(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as { payload?: unknown };
    if (!o || typeof o.payload !== "object" || o.payload === null || Array.isArray(o.payload)) return null;
    const payload = o.payload as Record<string, unknown>;
    if (payload.v !== ARENA_WORKSPACE_PAYLOAD_VERSION) return null;
    return payload;
  } catch {
    return null;
  }
}

export function serializeWorkspaceSession(payload: Record<string, unknown>): string {
  return JSON.stringify({
    savedAt: Date.now(),
    payload,
  });
}
