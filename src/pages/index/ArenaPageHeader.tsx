import { Button } from "@/components/ui/button";
import { Grid3X3, Minimize2, Minus, Mountain, Plus, Wind, Zap } from "lucide-react";
import { PRESET_COUNTS } from "@/lib/shapeGenerators";
import { GRID_TEMPLATES } from "@/lib/gridTemplates";
import { FONT_SCALE_STEPS } from "@/lib/uiPreferences";
import type { Mode } from "./arenaIndexConstants";

type Props = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onPrefetchCavesPanel: () => void;
  appVersion: string;
  online: boolean;
  fontScaleStep: number;
  onFontScaleStepChange: (next: number) => void;
  compactUi: boolean;
  onCompactUiChange: (v: boolean) => void;
  /** Short label: Auto / Calm / Full */
  reduceMotionLabel: string;
  onReduceMotionCycle: () => void;
};

export default function ArenaPageHeader({
  mode,
  onModeChange,
  onPrefetchCavesPanel,
  appVersion,
  online,
  fontScaleStep,
  onFontScaleStepChange,
  compactUi,
  onCompactUiChange,
  reduceMotionLabel,
  onReduceMotionCycle,
}: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-black/60 backdrop-blur-xl shadow-[0_4px_40px_hsl(220_60%_2%/0.45)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,hsl(145_72%_46%/0.07)_0%,transparent_40%,hsl(187_82%_52%/0.05)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(ellipse_80%_120%_at_15%_0%,hsl(145_72%_46%/0.75)_0%,transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex w-full max-w-[min(100%,88rem)] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="min-w-0 space-y-2.5">
          <p className="ark-kicker">ARK Master Suite · Arena workspace</p>
          <h1 className="font-display flex flex-wrap items-center gap-2.5 text-xl tracking-[0.12em] text-foreground sm:text-2xl md:text-3xl md:gap-3 md:tracking-[0.14em]">
            <span className="text-2xl drop-shadow-[0_0_14px_hsl(145_72%_46%/0.65)] sm:text-3xl" aria-hidden>
              ⚡
            </span>
            <span className="bg-gradient-to-r from-primary via-neon-cyan to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-title-shimmer">
              ARENA WORKSPACE
            </span>
          </h1>
          <p className="ark-muted-prose max-w-2xl">
            Console build generator — presets for events & arenas · paste-ready <span className="font-mono text-foreground/90">spawnactor</span> /{" "}
            <span className="font-mono text-foreground/90">Summon</span> · ground plane <span className="text-neon-cyan">X+Y</span>, height{" "}
            <span className="text-primary">Z</span>
          </p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className="ark-chip">{PRESET_COUNTS.shapes} shapes</span>
            <span className="ark-chip">{PRESET_COUNTS.arenas} arenas</span>
            <span className="ark-chip">{PRESET_COUNTS.events} events</span>
            <span className="ark-chip">{PRESET_COUNTS.creatures} creatures</span>
            <span className="ark-chip border-neon-cyan/30 bg-neon-cyan/8 text-neon-cyan">{GRID_TEMPLATES.length} grid templates</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:items-end shrink-0 lg:pb-0.5">
          <div className="ark-mode-rail" role="group" aria-label="Build mode">
            <Button
              variant={mode === "grid" ? "neon" : "neonOutline"}
              size="sm"
              onClick={() => onModeChange("grid")}
              className="gap-1.5 rounded-xl px-3.5 font-display text-[11px] tracking-wide sm:text-xs"
              data-testid="mode-grid"
              aria-pressed={mode === "grid"}
            >
              <Grid3X3 className="h-3.5 w-3.5" aria-hidden /> Grid
            </Button>
            <Button
              variant={mode === "shape" ? "neon" : "neonOutline"}
              size="sm"
              onClick={() => onModeChange("shape")}
              className="gap-1.5 rounded-xl px-3.5 font-display text-[11px] tracking-wide sm:text-xs"
              data-testid="mode-shape"
              aria-pressed={mode === "shape"}
            >
              <Zap className="h-3.5 w-3.5" aria-hidden /> Structures
            </Button>
            <Button
              variant={mode === "caves" ? "neon" : "neonOutline"}
              size="sm"
              onClick={() => onModeChange("caves")}
              onMouseEnter={() => {
                if (mode !== "caves") onPrefetchCavesPanel();
              }}
              onFocus={() => {
                if (mode !== "caves") onPrefetchCavesPanel();
              }}
              className="gap-1.5 rounded-xl px-3.5 font-display text-[11px] tracking-wide sm:text-xs"
              data-testid="mode-caves"
              aria-pressed={mode === "caves"}
            >
              <Mountain className="h-3.5 w-3.5" aria-hidden /> Caves
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-2 text-[10px] font-display text-muted-foreground">
              <span className={online ? "text-primary/85" : "text-destructive"} aria-live="polite">
                {online ? "● Online" : "● Offline"}
              </span>
              <span className="font-mono opacity-80">v{appVersion}</span>
            </div>
            <div className="ark-header-pill flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={fontScaleStep <= 0}
                onClick={() => onFontScaleStepChange(fontScaleStep - 1)}
                aria-label="Smaller text"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-[2.25rem] text-center font-mono text-[9px] text-muted-foreground">
                {Math.round(FONT_SCALE_STEPS[fontScaleStep]! * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={fontScaleStep >= FONT_SCALE_STEPS.length - 1}
                onClick={() => onFontScaleStepChange(fontScaleStep + 1)}
                aria-label="Larger text"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={compactUi ? "neon" : "ghost"}
                size="sm"
                className="h-7 gap-1 px-2 text-[9px] font-display"
                onClick={() => onCompactUiChange(!compactUi)}
                aria-pressed={compactUi}
                aria-label="Compact layout"
              >
                <Minimize2 className="h-3 w-3" />
                <span className="hidden sm:inline">Compact</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-[9px] font-display"
                onClick={onReduceMotionCycle}
                title="Cycle motion: Auto (OS) → Calm → Full"
                aria-label={`Motion preference: ${reduceMotionLabel}. Click to cycle.`}
              >
                <Wind className="h-3 w-3 shrink-0" aria-hidden />
                <span className="hidden min-[400px]:inline">{reduceMotionLabel}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
