import { describe, expect, it } from "vitest";
import { buildDiagnosticsExport } from "@/lib/buildDiagnostics";

describe("buildDiagnosticsExport", () => {
  it("includes schema and build stats", () => {
    const d = buildDiagnosticsExport({
      appVersion: "9.9.9",
      workspaceSnapshot: { v: 2, mode: "grid" },
      mode: "grid",
      buildLabel: "Flat Grid",
      totalCommands: 1200,
      totalChunks: 3,
      chunkSize: 160,
      copyMode: "multiline",
      commandOutputStyle: "spawnactor",
      clipboardCharsApprox: 50000,
      downloadBytesApprox: 51000,
      shapeGenMs: null,
      shapeGenPending: false,
      warnThreshold: 8000,
      maxCommandsLimit: 999999,
    });
    expect(d.schema).toBe("ark-arena-architect-diagnostics");
    expect(d.appVersion).toBe("9.9.9");
    expect((d as { build: { totalCommands: number } }).build.totalCommands).toBe(1200);
    expect((d as { workspace: { mode: string } }).workspace.mode).toBe("grid");
  });
});
