import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Download, Play, StepForward, RotateCcw, Timer, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

const STORAGE_CHIME = "pasteMacro.chimeOnCopy";
const STORAGE_DELAY = "pasteMacro.delaySec";

function readChime(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_CHIME);
    if (v === "0") return false;
    if (v === "1") return true;
  } catch {
    /* ignore */
  }
  return false;
}

function readDelay(): number {
  try {
    const v = localStorage.getItem(STORAGE_DELAY);
    if (v) {
      const n = parseFloat(v);
      if (!Number.isNaN(n) && n >= 3 && n <= 45) return n;
    }
  } catch {
    /* ignore */
  }
  return 8;
}

function playChime() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    o.type = "sine";
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.07);
    ctx.resume();
  } catch {
    /* ignore */
  }
}

export interface PasteMacroPanelProps {
  totalChunks: number;
  chunkRanges: { start: number; end: number }[];
  formattedChunks: string[];
  /** Copy chunk by index; return whether clipboard write succeeded. */
  onCopyChunk: (index: number) => boolean | Promise<boolean>;
  /** When build / chunk settings change, bump to reset session. */
  resetKey: string | number;
}

function toAhkString(v: string): string {
  return v.replace(/`/g, "``").replace(/"/g, "\"\"").replace(/\n/g, "`n");
}

function buildAhkScript(chunks: string[]): string {
  const list = chunks.map((c) => `chunks.Push("${toAhkString(c)}")`).join("\n");
  return `#SingleInstance Force
SetTitleMatchMode, 2
SendMode Input

; Edit these titles to match your windows.
ARK_TITLE := "ARK"
APP_TITLE := "ARK Master Suite"

PASTE_DELAY_MS := 450
INTER_CHUNK_DELAY_MS := 900
SWITCH_DELAY_MS := 240

chunks := []
${list}

if (chunks.MaxIndex() < 1) {
  MsgBox, 48, Macro, No chunks found.
  ExitApp
}

MsgBox, 64, Macro Ready, F8 = Start\`nEsc = Stop
return

F8::
Loop % chunks.MaxIndex()
{
  idx := A_Index
  Clipboard := chunks[idx]
  ClipWait, 1

  ; Jump to game window and paste.
  WinActivate, %ARK_TITLE%
  Sleep, %SWITCH_DELAY_MS%
  Send ^v
  Sleep, %PASTE_DELAY_MS%
  Send {Enter}
  Sleep, %INTER_CHUNK_DELAY_MS%

  ; Return to app window between chunks so it truly alternates tabs/windows.
  WinActivate, %APP_TITLE%
  Sleep, %SWITCH_DELAY_MS%
}
MsgBox, 64, Done, All chunks pasted.
return

Esc::ExitApp
`;
}

/**
 * Step-through paste helper: browsers only allow clipboard writes after a user gesture,
 * so we cannot paste into ARK automatically. This walks the chunk list: each Next / Space
 * copies the following chunk after you paste the previous one in-game.
 */
export default function PasteMacroPanel({ totalChunks, chunkRanges, formattedChunks, onCopyChunk, resetKey }: PasteMacroPanelProps) {
  const [lastCopied, setLastCopied] = useState<number | null>(null);
  const lastRef = useRef<number | null>(null);
  lastRef.current = lastCopied;

  const [autoEnabled, setAutoEnabled] = useState(false);
  const [delaySec, setDelaySec] = useState(readDelay);
  const [chime, setChime] = useState(readChime);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLastCopied(null);
    setAutoEnabled(false);
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, [resetKey]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHIME, chime ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [chime]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DELAY, String(delaySec));
    } catch {
      /* ignore */
    }
  }, [delaySec]);

  const stopAuto = useCallback(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    setAutoEnabled(false);
  }, []);

  const maybeChime = useCallback(() => {
    if (chime) playChime();
  }, [chime]);

  const startSession = useCallback(async () => {
    if (totalChunks < 1) return;
    stopAuto();
    const ok = await onCopyChunk(0);
    if (ok) {
      setLastCopied(0);
      maybeChime();
    }
  }, [totalChunks, onCopyChunk, stopAuto, maybeChime]);

  const advance = useCallback(async () => {
    const cur = lastRef.current;
    if (cur === null) {
      toast.message("Press Start macro first");
      return;
    }
    if (cur >= totalChunks - 1) {
      toast.message("Macro complete — Reset to run again");
      return;
    }
    const nextIdx = cur + 1;
    const ok = await onCopyChunk(nextIdx);
    if (ok) {
      setLastCopied(nextIdx);
      maybeChime();
    } else {
      stopAuto();
    }
  }, [totalChunks, onCopyChunk, maybeChime, stopAuto]);

  useEffect(() => {
    if (lastCopied === null) return;
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT") return;
      if (autoEnabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lastCopied, advance, autoEnabled]);

  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, []);

  const startAuto = useCallback(async () => {
    if (totalChunks < 2) {
      toast.message("Need at least 2 chunks for timed advance");
      return;
    }
    stopAuto();
    const ok = await onCopyChunk(0);
    if (!ok) {
      toast.error("Clipboard blocked — use manual macro (Next / Space)");
      return;
    }
    setLastCopied(0);
    maybeChime();
    setAutoEnabled(true);

    autoTimerRef.current = setInterval(async () => {
      const cur = lastRef.current;
      if (cur === null) {
        stopAuto();
        return;
      }
      const nextIdx = cur + 1;
      if (nextIdx >= totalChunks) {
        toast.success("All chunks copied — auto macro complete");
        stopAuto();
        return;
      }
      const wrote = await onCopyChunk(nextIdx);
      if (wrote) {
        setLastCopied(nextIdx);
        maybeChime();
      } else {
        toast.error("Auto macro stopped — browser blocked clipboard. Use Next after each paste.");
        stopAuto();
      }
    }, delaySec * 1000);
  }, [totalChunks, onCopyChunk, stopAuto, maybeChime, delaySec]);

  const reset = useCallback(() => {
    stopAuto();
    setLastCopied(null);
    toast.message("Macro reset");
  }, [stopAuto]);

  const downloadDesktopMacro = useCallback(() => {
    if (!formattedChunks.length) {
      toast.error("No chunks available for macro export");
      return;
    }
    const script = buildAhkScript(formattedChunks);
    const blob = new Blob([script], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ark_paste_macro.ahk";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded ark_paste_macro.ahk");
  }, [formattedChunks]);

  if (totalChunks < 1) return null;

  const done = lastCopied !== null && lastCopied >= totalChunks - 1;
  const atStart = lastCopied === null;
  const rangeLabel =
    lastCopied !== null && chunkRanges[lastCopied]
      ? `cmds ${chunkRanges[lastCopied].start}–${chunkRanges[lastCopied].end}`
      : null;

  return (
    <div className="card-ark p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="ark-section-title text-sm flex items-center gap-2">
            <Timer className="h-4 w-4 text-neon-cyan" /> Paste macro
          </h3>
          <p className="mt-1 text-[9px] text-muted-foreground leading-snug">
            Browsers cannot paste into ARK for you. This copies chunk 1, you paste in the console, then{" "}
            <kbd className="rounded border border-border/50 bg-secondary/50 px-1 font-mono text-[9px]">Space</kbd> or{" "}
            <span className="font-mono text-foreground/90">Next</span> for the following chunk. Timed auto may be blocked
            after the first copy — manual is most reliable. For full tab/window switching, download the desktop macro below.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="neon"
          size="sm"
          className="gap-1.5 font-display text-xs"
          onClick={startSession}
          disabled={autoEnabled}
        >
          <Play className="h-3.5 w-3.5" /> Start
        </Button>
        <Button
          type="button"
          variant="neonOutline"
          size="sm"
          className="gap-1.5 font-display text-xs"
          onClick={() => advance()}
          disabled={autoEnabled || atStart || done}
        >
          <StepForward className="h-3.5 w-3.5" /> Next chunk
        </Button>
        <Button type="button" variant="outline" size="sm" className="gap-1.5 font-display text-xs" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
        <Button type="button" variant="outline" size="sm" className="gap-1.5 font-display text-xs" onClick={downloadDesktopMacro}>
          <Download className="h-3.5 w-3.5" /> Desktop macro (.ahk)
        </Button>
      </div>

      <div className="rounded-lg border border-border/40 bg-secondary/20 px-3 py-2 text-center">
        <p className="font-display text-xs tabular-nums text-foreground">
          {atStart ? (
            <span className="text-muted-foreground">Ready — {totalChunks} chunk{totalChunks === 1 ? "" : "s"}</span>
          ) : (
            <>
              Chunk <span className="text-primary">{(lastCopied ?? 0) + 1}</span> / {totalChunks}
              {rangeLabel && <span className="text-muted-foreground"> · {rangeLabel}</span>}
            </>
          )}
        </p>
        {!atStart && !autoEnabled && (
          <p className="mt-1 text-[9px] text-muted-foreground">
            Focus this page (not the game) and press Space for next — or click Next chunk.
          </p>
        )}
      </div>

      <div className="space-y-2 border-t border-border/30 pt-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[10px] text-muted-foreground">Copy chime</Label>
          <div className="flex items-center gap-2">
            {chime ? <Volume2 className="h-3.5 w-3.5 text-muted-foreground" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
            <Switch checked={chime} onCheckedChange={setChime} />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">Auto-advance delay (experimental)</Label>
            <span className="font-mono text-[10px] text-primary tabular-nums">{delaySec}s</span>
          </div>
          <Slider
            value={[delaySec]}
            min={3}
            max={45}
            step={1}
            onValueChange={(v) => setDelaySec(v[0])}
            disabled={autoEnabled}
            className="py-1"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {!autoEnabled ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="font-display text-[10px]"
              onClick={startAuto}
              disabled={totalChunks < 2}
            >
              Start timed auto
            </Button>
          ) : (
            <Button type="button" variant="destructive" size="sm" className="font-display text-[10px]" onClick={stopAuto}>
              Stop timed auto
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
