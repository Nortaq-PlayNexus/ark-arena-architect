import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  ListOrdered,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import CommandWarnings from "@/components/CommandWarnings";
import CommandStats from "@/components/CommandStats";
import VirtualizedCommandLines from "@/components/VirtualizedCommandLines";
import { MAX_PASTE_CHUNK_CHARS, type Footprint } from "@/lib/generatorHelpers";
import type { RecentBuild } from "@/lib/presetsStorage";
import type { CommandOutputStyle, Mode } from "@/pages/index/arenaIndexConstants";

const Preview3D = lazy(() => import("@/components/Preview3D"));
const PasteMacroPanel = lazy(() => import("@/components/PasteMacroPanel"));

export type TelemetryPoint = { t: number; gen: number; copy: number; heap: number };

export type ArenaPreviewColumnProps = {
  totalCommands: number;
  mode: Mode;
  currentBuildLabel: string;
  shapeGenPending: boolean;
  shapeGenMs: number | null;
  totalChunks: number;
  chunkSize: number;
  copyAll: () => void | Promise<void>;
  downloadFile: () => void;
  show3D: boolean;
  setShow3D: (v: boolean | ((b: boolean) => boolean)) => void;
  previewCommandsFor3D: string[];
  commandOutputStyle: CommandOutputStyle;
  showStats: boolean;
  setShowStats: (v: boolean | ((b: boolean) => boolean)) => void;
  commandsWorld: string[];
  footprint: Footprint;
  lastCopyMs: number | null;
  heapMB: number | null;
  telemetryHistory: TelemetryPoint[];
  chunkProgress: number;
  copiedChunks: Set<number>;
  chunkRanges: Array<{ start: number; end: number }>;
  copyChunk: (index: number) => boolean | Promise<boolean>;
  formattedPasteChunks: string[];
  macroResetKey: string | number;
  commands: string[];
  showPreview: boolean;
  setShowPreview: (v: boolean | ((b: boolean) => boolean)) => void;
  recentBuilds: RecentBuild[];
  clipboardCharCount: number;
  downloadSizeBytes: number;
  onCopyBuildSummary: () => void | Promise<void>;
  onDownloadCommandsCsv: () => void;
  commandLineNumbers: boolean;
  onToggleCommandLineNumbers: () => void;
};

export default function ArenaPreviewColumn(p: ArenaPreviewColumnProps) {
  return (
    <aside className="order-1 min-w-0 w-full space-y-4 xl:sticky xl:top-[6.75rem] xl:order-2 xl:max-h-[calc(100vh-7rem)] xl:w-[min(100%,400px)] xl:shrink-0 xl:overflow-y-auto xl:self-start xl:scrollbar-ark">
      <CommandWarnings count={p.totalCommands} />

      <div className="card-ark space-y-2 p-4">
        <p className="font-display text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Current build</p>
        <p className="font-display text-sm text-foreground leading-snug">{p.currentBuildLabel}</p>
        <p className="text-[11px] text-muted-foreground">
          <span className="font-mono tabular-nums text-primary">{p.totalCommands.toLocaleString()}</span> commands
          {p.mode === "shape" && (
            <span className="ml-2 text-[10px] text-muted-foreground">
              {p.shapeGenPending ? "generating..." : `gen ${p.shapeGenMs ?? 0}ms`}
            </span>
          )}
          {p.totalChunks > 1 && (
            <span>
              {" "}
              · {p.totalChunks} paste{p.totalChunks === 1 ? "" : "s"} · ≤{p.chunkSize} cmds · ≤{MAX_PASTE_CHUNK_CHARS.toLocaleString()} chars
            </span>
          )}
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Copy-all payload ~<span className="font-mono tabular-nums text-foreground/90">{p.clipboardCharCount.toLocaleString()}</span> chars · Download ~
          <span className="font-mono tabular-nums text-foreground/90">{formatBytes(p.downloadSizeBytes)}</span>
        </p>
        {p.totalChunks > 1 && (
          <p className="text-[9px] text-muted-foreground leading-snug border border-border/40 rounded-md bg-secondary/15 px-2 py-1.5">
            Multi-paste workflow: use the per-chunk copy buttons in order; checkmarks track what you already pasted. Command palette (Ctrl+K) can copy first/last chunk only or clear chunk progress. Use Download .csv for spreadsheet-friendly export.
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-full gap-1.5 text-[10px] font-display"
          onClick={() => void p.onCopyBuildSummary()}
        >
          <ClipboardList className="h-3 w-3 shrink-0" aria-hidden /> Copy build summary
        </Button>
      </div>

      <div className="hidden flex-col gap-2 xl:flex">
        <Button
          variant="neon"
          onClick={() => void p.copyAll()}
          className="h-11 gap-2 font-display text-sm tracking-wide shadow-[0_0_24px_hsl(145_72%_46%/0.25)]"
        >
          <Copy className="h-4 w-4" /> Copy all ({p.totalCommands.toLocaleString()})
        </Button>
        <Button variant="ember" onClick={p.downloadFile} className="h-11 gap-2 font-display text-sm tracking-wide">
          <Download className="h-4 w-4" /> Download .txt
        </Button>
        <Button variant="outline" onClick={p.onDownloadCommandsCsv} className="h-11 gap-2 font-display text-sm tracking-wide">
          <FileSpreadsheet className="h-4 w-4" /> Download .csv
        </Button>
      </div>

      <div className="card-ark p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="ark-section-title text-sm flex items-center gap-2">
            <span className="text-primary drop-shadow-[0_0_8px_hsl(145_72%_46%/0.5)]">◆</span> 3D preview
          </h3>
          <Button variant="ghost" size="sm" onClick={() => p.setShow3D(!p.show3D)} className="gap-1 text-[10px]">
            {p.show3D ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {p.show3D ? "Hide" : "Show"}
          </Button>
        </div>
        {p.show3D && (
          <Suspense
            fallback={
              <div className="flex h-56 w-full items-center justify-center rounded-xl border border-border/40 bg-secondary/25 bg-[radial-gradient(ellipse_at_center,hsl(145_72%_46%/0.06),transparent_70%)] sm:h-72">
                <span className="font-display text-xs tracking-wide text-muted-foreground animate-pulse">Loading 3D engine…</span>
              </div>
            }
          >
            <Preview3D commands={p.previewCommandsFor3D} maxPoints={72000} outputStyle={p.commandOutputStyle} />
          </Suspense>
        )}
      </div>

      <div className="card-ark p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="ark-section-title text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-neon-cyan drop-shadow-[0_0_10px_hsl(187_82%_52%/0.35)]" /> Statistics
          </h3>
          <Button variant="ghost" size="sm" onClick={() => p.setShowStats(!p.showStats)} className="gap-1 text-[10px]">
            {p.showStats ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
        {p.showStats && (
          <CommandStats
            commands={p.commandsWorld}
            footprint={p.footprint}
            chunkSize={p.chunkSize}
            pasteChunkCount={p.totalChunks}
          />
        )}
      </div>

      <div className="card-ark p-4 space-y-2">
        <h3 className="ark-section-title text-sm">Telemetry</h3>
        <p className="text-[11px] text-muted-foreground">
          Gen: <span className="font-mono text-foreground">{p.shapeGenMs ?? 0}ms</span> · Copy:{" "}
          <span className="font-mono text-foreground">{p.lastCopyMs ?? 0}ms</span>
        </p>
        <p className="text-[11px] text-muted-foreground">
          Heap: <span className="font-mono text-foreground">{p.heapMB ?? 0}MB</span> · Cmd/s:{" "}
          <span className="font-mono text-foreground">
            {p.lastCopyMs && p.lastCopyMs > 0 ? Math.round((p.totalCommands / p.lastCopyMs) * 1000) : 0}
          </span>
        </p>
        <div className="h-16 rounded border border-border/60 bg-background/40 p-1">
          <div className="h-full flex items-end gap-[2px]">
            {p.telemetryHistory.map((row) => {
              const v = Math.max(row.gen, row.copy, row.heap);
              const h = Math.max(6, Math.min(100, Math.round(v / 4)));
              return <div key={row.t} className="flex-1 bg-neon-cyan/60 rounded-sm" style={{ height: `${h}%` }} />;
            })}
          </div>
        </div>
      </div>

      {p.totalChunks > 1 && (
        <div className="card-ark p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="ark-section-title text-sm">Paste Progress</h3>
            <span className="text-xs text-muted-foreground font-display">
              {p.copiedChunks.size}/{p.totalChunks} chunks · {Math.round(p.chunkProgress)}%
            </span>
          </div>
          <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary/50 ring-1 ring-inset ring-white/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-neon-cyan to-primary shadow-[0_0_12px_hsl(145_72%_46%/0.35)] transition-[width] duration-500 ease-out"
              style={{ width: `${p.chunkProgress}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: Math.min(p.totalChunks, 100) }, (_, i) => {
              const range = p.chunkRanges[i];
              const isCopied = p.copiedChunks.has(i);
              return (
                <Button
                  key={i}
                  variant={isCopied ? "neon" : "neonOutline"}
                  size="sm"
                  onClick={() => void p.copyChunk(i)}
                  className="text-[10px] font-body px-2 py-1"
                >
                  {isCopied ? "✓" : ""} {range.start}–{range.end}
                </Button>
              );
            })}
            {p.totalChunks > 100 && (
              <span className="text-xs text-muted-foreground self-center">...{p.totalChunks - 100} more</span>
            )}
          </div>
        </div>
      )}

      {p.totalChunks > 1 && (
        <Suspense fallback={<div className="card-ark p-4 text-xs text-muted-foreground">Loading macro panel…</div>}>
          <PasteMacroPanel
            totalChunks={p.totalChunks}
            chunkRanges={p.chunkRanges}
            formattedChunks={p.formattedPasteChunks}
            onCopyChunk={p.copyChunk}
            resetKey={p.macroResetKey}
          />
        </Suspense>
      )}

      <div className="card-ark p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="ark-section-title text-sm min-w-0">Command Preview</h3>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant={p.commandLineNumbers ? "neon" : "ghost"}
              size="sm"
              onClick={() => p.onToggleCommandLineNumbers()}
              className="text-[10px] gap-1 h-8 px-2"
              aria-pressed={p.commandLineNumbers}
              title="Toggle line numbers"
              aria-label={p.commandLineNumbers ? "Hide line numbers" : "Show line numbers"}
            >
              <ListOrdered className="w-3 h-3" aria-hidden />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => p.setShowPreview(!p.showPreview)} className="text-[10px] gap-1 h-8 px-2">
              {p.showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>
        </div>
        {p.showPreview && (
          <div className="space-y-2">
            <VirtualizedCommandLines lines={p.commands} showLineNumbers={p.commandLineNumbers} />
            <p className="text-[9px] text-muted-foreground">
              Virtualized scroll — all <span className="font-mono text-foreground/90">{p.totalCommands.toLocaleString()}</span> commands.
              Hover a row for <span className="text-foreground/80">copy one line</span>. Long lines are truncated in the list; use Copy all or Download for full text.
            </p>
          </div>
        )}
      </div>

      {p.recentBuilds.length > 0 && (
        <div className="card-ark p-5">
          <h3 className="ark-section-title text-sm mb-3">Recent Builds</h3>
          <div className="space-y-1">
            {p.recentBuilds.slice(0, 8).map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-secondary/15 px-3 py-2 text-xs transition-colors hover:border-primary/20 hover:bg-secondary/30"
              >
                <span className="font-display text-foreground">{b.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {b.commands.toLocaleString()} cmds · {new Date(b.time).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-ark p-5">
        <h3 className="ark-section-title text-sm mb-2">How ARK Coordinates Work</h3>
        <div className="text-xs text-muted-foreground space-y-1.5">
          <p>
            <strong className="text-neon-cyan">X</strong> = horizontal (left/right) · <strong className="text-accent">Y</strong> = horizontal (forward/back) ·{" "}
            <strong className="text-primary">Z</strong> = vertical (height)
          </p>
          <p>
            The <strong>ground plane</strong> is always X + Y. Height is always Z. All structures are centered around the specified center point.
          </p>
          <p>
            Use <strong>Step</strong> to control density — smaller step = more commands but finer detail. Use <strong>Radius</strong> to control overall size.
          </p>
          <p>
            Press <kbd className="bg-secondary text-foreground px-1 rounded text-[10px] font-mono">?</kbd> for keyboard shortcuts.
          </p>
        </div>
      </div>
    </aside>
  );
}
