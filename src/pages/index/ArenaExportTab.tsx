import type { LegacyRef, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, ChevronDown, ChevronUp, Copy, Download, FolderOpen, MapPin, RotateCcw, Save, Stethoscope, Trash2, Upload, Trash } from "lucide-react";
import BlueprintLibrary from "@/components/BlueprintLibrary";
import ShareConfig from "@/components/ShareConfig";
import { MAX_PASTE_CHUNK_CHARS } from "@/lib/generatorHelpers";
import { CHUNK_PRESETS } from "@/pages/index/arenaIndexConstants";
import { Field, ToggleOption } from "@/pages/index/indexFormFields";
import type { Mode } from "@/pages/index/arenaIndexConstants";
import type { SpawnAnchorChoice } from "@/pages/index/arenaIndexConstants";
import { MAX_TELEPORT_BOOKMARKS, type TeleportBookmark } from "@/lib/teleportBookmarks";
import { QUICK_SLOT_COUNT } from "@/lib/workspaceQuickSlots";
import type { PresetMap } from "@/lib/presetsStorage";
import { toast } from "sonner";

export type PresetDiff = {
  added: string[];
  removed: string[];
  changed: { key: string; left: string; right: string }[];
};

export type ArenaExportTabProps = {
  showBPLibrary: boolean;
  setShowBPLibrary: (v: boolean | ((p: boolean) => boolean)) => void;
  blueprint: string;
  setBlueprint: (v: string) => void;
  chunkSize: number;
  setChunkSize: (v: number) => void;
  copyMode: "multiline" | "singleline";
  setCopyMode: (v: "multiline" | "singleline") => void;
  includeTeleport: boolean;
  setIncludeTeleport: (v: boolean) => void;
  teleportX: number;
  setTeleportX: (v: number) => void;
  teleportY: number;
  setTeleportY: (v: number) => void;
  teleportZ: number;
  setTeleportZ: (v: number) => void;
  copyTeleportLineOnly: () => void | Promise<void>;
  tpBookmarks: TeleportBookmark[];
  bookmarkDraft: string;
  setBookmarkDraft: (v: string) => void;
  saveTpBookmark: () => void;
  removeTpBookmark: (id: string) => void;
  mode: Mode;
  spawnAnchor: SpawnAnchorChoice;
  customFileName: string;
  setCustomFileName: (v: string) => void;
  shareConfig: Record<string, unknown>;
  onImportArenaShareJson: (obj: Record<string, unknown>) => void;
  presetName: string;
  setPresetName: (v: string) => void;
  handleSavePreset: () => void;
  presetSearch: string;
  setPresetSearch: (v: string) => void;
  handleExportPresets: () => void;
  handleRestorePresetAutosave: () => void;
  presetAutosaveAt: number | null;
  presetImportRef: RefObject<HTMLInputElement | null>;
  handleImportPresets: (file: File) => void | Promise<void>;
  filteredSavedPresets: [string, unknown][];
  savedPresets: PresetMap;
  handleLoadPreset: (name: string) => void;
  deletePreset: (name: string) => void;
  comparePresetA: string;
  setComparePresetA: (v: string) => void;
  comparePresetB: string;
  setComparePresetB: (v: string) => void;
  presetDiff: PresetDiff;
  onDownloadDiagnostics: () => void;
  quickSlotsFilled: boolean[];
  onSaveQuickSlot: (index: number) => void;
  onRestoreQuickSlot: (index: number) => void;
  onClearQuickSlot: (index: number) => void;
  onExportRecentBuildsCsv: () => void;
};

export default function ArenaExportTab(p: ArenaExportTabProps) {
  return (
    <>
      <div className="card-ark p-5 space-y-4">
        <button type="button" onClick={() => p.setShowBPLibrary(!p.showBPLibrary)} className="flex w-full items-center justify-between">
          <h3 className="ark-section-title">Blueprint Library</h3>
          {p.showBPLibrary ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </button>
        {p.showBPLibrary ? (
          <BlueprintLibrary value={p.blueprint} onChange={p.setBlueprint} />
        ) : (
          <div>
            <Label className="text-[10px] text-muted-foreground">Blueprint Path</Label>
            <Input value={p.blueprint} onChange={(e) => p.setBlueprint(e.target.value)} className="ark-input mt-0.5 font-mono text-[10px]" />
          </div>
        )}
      </div>

      <div className="card-ark p-5 space-y-4">
        <h3 className="ark-section-title">Output Settings</h3>
        <div>
          <Label className="text-xs text-muted-foreground">Chunk Size (max commands per paste)</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {CHUNK_PRESETS.map((size) => (
              <Button
                key={size}
                variant={p.chunkSize === size ? "neon" : "neonOutline"}
                size="sm"
                onClick={() => p.setChunkSize(size)}
                className="text-xs font-display flex-1 min-w-[3rem]"
              >
                {size}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-[9px] text-muted-foreground leading-snug">
            Pastes are also split near <span className="font-mono text-foreground/90">{MAX_PASTE_CHUNK_CHARS.toLocaleString()}</span> characters. If the game still bluescreens on paste, pick a smaller chunk size or use Single-line copy.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Copy Mode</Label>
          <div className="flex gap-1">
            <Button variant={p.copyMode === "multiline" ? "neon" : "neonOutline"} size="sm" onClick={() => p.setCopyMode("multiline")} className="text-[10px] font-display">
              Multi
            </Button>
            <Button variant={p.copyMode === "singleline" ? "neon" : "neonOutline"} size="sm" onClick={() => p.setCopyMode("singleline")} className="text-[10px] font-display">
              Single
            </Button>
          </div>
        </div>
      </div>

      <div className="card-ark p-5 space-y-4">
        <h3 className="ark-section-title flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary/90" /> Teleport & Download
        </h3>
        <ToggleOption label="Include Teleport Command" checked={p.includeTeleport} onChange={p.setIncludeTeleport} />
        {p.includeTeleport && (
          <>
            <p className="text-[9px] text-muted-foreground leading-snug">
              Your character&apos;s feet position (from <span className="font-mono">cheat getplayerpos</span> / overlay). Saved in this browser for next time.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Field label="TP X" value={p.teleportX} onChange={p.setTeleportX} />
              <Field label="TP Y" value={p.teleportY} onChange={p.setTeleportY} />
              <Field label="TP Z" value={p.teleportZ} onChange={p.setTeleportZ} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-1 text-[10px] font-display" onClick={() => void p.copyTeleportLineOnly()}>
                <Copy className="w-3 h-3" /> Copy TP line
              </Button>
            </div>
            <div className="rounded-md border border-border/50 bg-secondary/15 p-2 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-display uppercase tracking-wide">
                <Bookmark className="w-3 h-3 text-primary/80" /> Teleport bookmarks
                <span className="normal-case text-[9px] opacity-80">({p.tpBookmarks.length}/{MAX_TELEPORT_BOOKMARKS})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {p.tpBookmarks.map((b) => (
                  <div key={b.id} className="flex items-center gap-0.5 rounded border border-border/40 bg-background/60 pl-2 pr-0.5 py-0.5">
                    <button
                      type="button"
                      className="text-[10px] text-foreground hover:text-primary max-w-[9rem] truncate"
                      onClick={() => {
                        p.setTeleportX(b.x);
                        p.setTeleportY(b.y);
                        p.setTeleportZ(b.z);
                        toast.success(`Teleport: ${b.label}`);
                      }}
                    >
                      {b.label}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${b.label}`}
                      onClick={() => p.removeTpBookmark(b.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5 min-[400px]:flex-row min-[400px]:items-center">
                <Input
                  value={p.bookmarkDraft}
                  onChange={(e) => p.setBookmarkDraft(e.target.value)}
                  placeholder="Name this position…"
                  className="ark-input h-8 text-xs flex-1"
                  maxLength={48}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      p.saveTpBookmark();
                    }
                  }}
                />
                <Button type="button" variant="neonOutline" size="sm" className="text-[10px] font-display shrink-0" onClick={p.saveTpBookmark}>
                  <Bookmark className="w-3 h-3" /> Save current TP
                </Button>
              </div>
            </div>
          </>
        )}
        {p.mode === "shape" && (
          <p className="text-[9px] text-muted-foreground border border-border/60 rounded p-2 bg-secondary/20 leading-snug">
            Default: <span className="text-foreground">In front (relative)</span> — copied lines use ahead / right / up from your character (no TP needed). Match{" "}
            <span className="text-foreground">Face yaw</span> to your view. Pick <span className="text-foreground">World face</span> if you need absolute map coordinates from TP.
          </p>
        )}
        {p.mode === "grid" && p.spawnAnchor !== "manual" && p.spawnAnchor !== "localLayout" && (
          <p className="text-[9px] text-muted-foreground border border-border/60 rounded p-2 bg-secondary/20">
            {p.spawnAnchor === "playerRelative"
              ? "Relative: no TP needed for placement. Face yaw + Forward / Right place the grid in front of you wherever you stand."
              : p.spawnAnchor === "teleportFace"
                ? "Face mode: TP = feet. Aim uses Forward / Right / Face yaw; with “center footprint” the build’s middle sits there so huge grids don’t sit far off to one side."
                : "Grid spawns use TP as your position (unless Manual origin). Paste your feet coords from the game."}
          </p>
        )}
        {p.mode === "grid" && p.spawnAnchor === "localLayout" && (
          <p className="text-[9px] text-muted-foreground border border-border/60 rounded p-2 bg-secondary/20">
            Local layout: spawn lines do not use TP fields — same pattern as a raw 0,0,0 · 300,0,500 list. Turn off Include Teleport if you position with cheat spi / SetPlayerPos yourself.
          </p>
        )}
        <div>
          <Label className="text-[10px] text-muted-foreground">File Name</Label>
          <Input placeholder="e.g. ice_cave_island" value={p.customFileName} onChange={(e) => p.setCustomFileName(e.target.value)} className="ark-input mt-0.5 text-xs" />
        </div>
      </div>

      <div className="card-ark p-5 space-y-4">
        <h3 className="ark-section-title">Share & Export</h3>
        <ShareConfig config={p.shareConfig} onImportJson={p.onImportArenaShareJson} />
      </div>

      <div className="card-ark p-5 space-y-3">
        <h3 className="ark-section-title flex items-center gap-2">
          <Bookmark className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden /> Quick workspace slots
        </h3>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Save the current grid / structures workspace to a local slot (same data as Share / Export JSON). Restore replaces all workspace fields; clearing removes only that slot.
        </p>
        <div className="space-y-2">
          {Array.from({ length: QUICK_SLOT_COUNT }, (_, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border/50 bg-secondary/20 px-2 py-1.5"
            >
              <span className="min-w-[3.5rem] font-mono text-[10px] text-muted-foreground">Slot {i + 1}</span>
              {p.quickSlotsFilled[i] ? (
                <span className="text-[9px] font-display uppercase tracking-wide text-primary">Saved</span>
              ) : (
                <span className="text-[9px] text-muted-foreground">Empty</span>
              )}
              <div className="ml-auto flex flex-wrap gap-1">
                <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] font-display" onClick={() => p.onSaveQuickSlot(i)}>
                  Save
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] font-display" onClick={() => p.onRestoreQuickSlot(i)}>
                  Restore
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-destructive" onClick={() => p.onClearQuickSlot(i)} aria-label={`Clear slot ${i + 1}`}>
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-1 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground leading-snug mb-2">Recent builds (from Copy all) export as a simple CSV for spreadsheets.</p>
          <Button type="button" variant="outline" size="sm" className="gap-1.5 text-[10px] font-display w-full sm:w-auto" onClick={p.onExportRecentBuildsCsv}>
            <Download className="w-3 h-3" aria-hidden /> Export recent builds as CSV
          </Button>
        </div>
      </div>

      <div className="card-ark p-5 space-y-3">
        <h3 className="ark-section-title flex items-center gap-2">
          <Stethoscope className="h-3.5 w-3.5 text-neon-cyan shrink-0" aria-hidden /> Support diagnostics
        </h3>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Download a JSON bundle for bug reports or event support: app version, browser, build stats, and the same workspace fields as Share / Export (no game credentials).
        </p>
        <Button type="button" variant="outline" size="sm" className="gap-1.5 text-[10px] font-display w-full sm:w-auto" onClick={p.onDownloadDiagnostics}>
          <Download className="w-3 h-3" aria-hidden /> Download diagnostics.json
        </Button>
      </div>

      <div className="card-ark p-5 space-y-4">
        <h3 className="ark-section-title">Presets</h3>
        <div className="flex gap-2">
          <Input placeholder="Preset name" value={p.presetName} onChange={(e) => p.setPresetName(e.target.value)} className="ark-input flex-1 text-xs" />
          <Button variant="outline" size="sm" onClick={p.handleSavePreset}>
            <Save className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search saved presets" value={p.presetSearch} onChange={(e) => p.setPresetSearch(e.target.value)} className="ark-input flex-1 text-xs" />
          <Button variant="outline" size="sm" onClick={p.handleExportPresets} className="gap-1 text-[10px] font-display">
            <Download className="w-3 h-3" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={p.handleRestorePresetAutosave} className="gap-1 text-[10px] font-display">
            <RotateCcw className="w-3 h-3" /> Restore autosave
          </Button>
          {p.presetAutosaveAt && (
            <span className="text-[10px] text-muted-foreground">autosave: {new Date(p.presetAutosaveAt).toLocaleString()}</span>
          )}
          <Button variant="outline" size="sm" onClick={() => p.presetImportRef.current?.click()} className="gap-1 text-[10px] font-display">
            <Upload className="w-3 h-3" /> Import
          </Button>
          <input
            ref={p.presetImportRef as LegacyRef<HTMLInputElement>}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void p.handleImportPresets(file);
              e.currentTarget.value = "";
            }}
          />
        </div>
        {p.filteredSavedPresets.length > 0 ? (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {p.filteredSavedPresets.map(([name]) => (
              <div key={name} className="flex items-center justify-between bg-secondary/30 rounded px-2 py-1">
                <button type="button" onClick={() => p.handleLoadPreset(name)} className="text-xs text-foreground hover:text-primary flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" /> {name}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    p.deletePreset(name);
                  }}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground">
            {Object.keys(p.savedPresets).length === 0 ? "No presets saved yet." : "No presets match your search."}
          </p>
        )}
        {Object.keys(p.savedPresets).length >= 2 && (
          <div className="space-y-2 rounded border border-border/60 bg-secondary/20 p-2">
            <p className="text-[10px] text-muted-foreground">Compare presets</p>
            <div className="grid grid-cols-2 gap-2">
              <Select value={p.comparePresetA} onValueChange={p.setComparePresetA}>
                <SelectTrigger className="ark-input h-8 text-xs">
                  <SelectValue placeholder="Preset A" />
                </SelectTrigger>
                <SelectContent>{Object.keys(p.savedPresets).map((n) => <SelectItem key={`a-${n}`} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={p.comparePresetB} onValueChange={p.setComparePresetB}>
                <SelectTrigger className="ark-input h-8 text-xs">
                  <SelectValue placeholder="Preset B" />
                </SelectTrigger>
                <SelectContent>{Object.keys(p.savedPresets).map((n) => <SelectItem key={`b-${n}`} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-[10px]"
                onClick={() => {
                  if (!p.comparePresetA || !p.comparePresetB) return;
                  const payload = {
                    left: p.comparePresetA,
                    right: p.comparePresetB,
                    diff: p.presetDiff,
                    exportedAt: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `preset-diff-${p.comparePresetA}-vs-${p.comparePresetB}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="w-3 h-3 mr-1" /> Export diff
              </Button>
            </div>
            {(p.presetDiff.added.length > 0 || p.presetDiff.removed.length > 0 || p.presetDiff.changed.length > 0) && (
              <div className="max-h-28 overflow-auto space-y-1">
                {p.presetDiff.added.map((k) => (
                  <div key={`a-${k}`} className="text-[10px] font-mono text-emerald-300">
                    + {k}
                  </div>
                ))}
                {p.presetDiff.removed.map((k) => (
                  <div key={`r-${k}`} className="text-[10px] font-mono text-rose-300">
                    - {k}
                  </div>
                ))}
                {p.presetDiff.changed.map((d) => (
                  <div key={d.key} className="text-[10px] font-mono text-muted-foreground">
                    <span className="text-foreground">{d.key}</span>: {d.left} → {d.right}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
