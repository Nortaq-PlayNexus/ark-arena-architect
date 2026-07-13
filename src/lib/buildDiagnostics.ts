/**
 * Structured JSON for event-day support (paste into tickets / compare environments).
 * No secrets — workspace snapshot matches Share / Export JSON (local settings only).
 */

export type BuildDiagnosticsInput = {
  appVersion: string;
  workspaceSnapshot: Record<string, unknown>;
  mode: string;
  buildLabel: string;
  totalCommands: number;
  totalChunks: number;
  chunkSize: number;
  copyMode: string;
  commandOutputStyle: string;
  clipboardCharsApprox: number;
  downloadBytesApprox: number;
  shapeGenMs: number | null;
  shapeGenPending: boolean;
  warnThreshold: number;
  maxCommandsLimit: number;
};

export function buildDiagnosticsExport(input: BuildDiagnosticsInput): Record<string, unknown> {
  return {
    schema: "ark-arena-architect-diagnostics",
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    appVersion: input.appVersion,
    client: {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      href: typeof window !== "undefined" ? window.location.href : "",
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      language: typeof navigator !== "undefined" ? navigator.language : "",
    },
    build: {
      mode: input.mode,
      label: input.buildLabel,
      totalCommands: input.totalCommands,
      totalChunks: input.totalChunks,
      chunkSize: input.chunkSize,
      copyMode: input.copyMode,
      commandOutputStyle: input.commandOutputStyle,
      clipboardCharsApprox: input.clipboardCharsApprox,
      downloadBytesApprox: input.downloadBytesApprox,
      shapeGenMs: input.shapeGenMs,
      shapeGenPending: input.shapeGenPending,
      limits: {
        warnThreshold: input.warnThreshold,
        maxCommands: input.maxCommandsLimit,
      },
    },
    workspace: input.workspaceSnapshot,
  };
}
