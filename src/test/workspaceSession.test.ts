import { describe, expect, it } from "vitest";
import {
  WORKSPACE_SESSION_STORAGE_KEY,
  parseWorkspaceSessionPayload,
  serializeWorkspaceSession,
} from "@/lib/workspaceSession";
import { ARENA_WORKSPACE_PAYLOAD_VERSION } from "@/lib/arenaWorkspacePayload";

describe("workspaceSession", () => {
  it("serializes and parses v2 payload", () => {
    const payload = { v: ARENA_WORKSPACE_PAYLOAD_VERSION, mode: "grid", maxX: 100 };
    const raw = serializeWorkspaceSession(payload);
    expect(raw).toContain("payload");
    const parsed = parseWorkspaceSessionPayload(raw);
    expect(parsed?.v).toBe(ARENA_WORKSPACE_PAYLOAD_VERSION);
    expect(parsed?.mode).toBe("grid");
  });

  it("rejects wrong version", () => {
    const raw = serializeWorkspaceSession({ v: 1, mode: "shape" });
    expect(parseWorkspaceSessionPayload(raw)).toBeNull();
  });

  it("uses stable storage key", () => {
    expect(WORKSPACE_SESSION_STORAGE_KEY).toMatch(/^ark_workspace/);
  });
});
