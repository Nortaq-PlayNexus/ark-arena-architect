import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, Search } from "lucide-react";

export type CommandPaletteMode = "grid" | "shape" | "caves";
export type CommandPaletteWorkspaceTab = "design" | "placement" | "export";

export type CommandPaletteExtras = {
  onDownloadDiagnostics?: () => void;
  onCopyWorkspaceJson?: () => void;
  onClearPasteProgress?: () => void;
  onClearTabSessionWorkspace?: () => void;
  onRandomizeGrid?: () => void;
  onResetShapePlacement?: () => void;
  onExportRecentBuildsCsv?: () => void;
  onDownloadCommandsCsv?: () => void;
  onCopyTeleportNumbers?: () => void;
  onCopyShapeCenters?: () => void;
  onSaveQuickSlot?: (index: number) => void;
  onRestoreQuickSlot?: (index: number) => void;
  onClearQuickSlot?: (index: number) => void;
  onCycleReduceMotion?: () => void;
  reduceMotionSummary?: string;
  onToggleCommandLineNumbers?: () => void;
  commandLineNumbersOn?: boolean;
  onCopyLastPasteChunk?: () => void;
  showCopyLastPasteChunk?: boolean;
};

type PaletteItem = {
  id: string;
  section: string;
  label: string;
  keywords: string;
  onSelect: () => void | Promise<void>;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onPickMode: (mode: CommandPaletteMode) => void;
  onPickWorkspaceTab: (tab: CommandPaletteWorkspaceTab) => void;
  onCopyAll: () => void | Promise<void>;
  onCopyBuildSummary: () => void | Promise<void>;
  onCopyFirstChunk?: () => void | Promise<void>;
  showCopyFirstChunk?: boolean;
  mode: CommandPaletteMode;
  show3D: boolean;
  setShow3D: (v: boolean | ((b: boolean) => boolean)) => void;
  showStats: boolean;
  setShowStats: (v: boolean | ((b: boolean) => boolean)) => void;
  showPreview: boolean;
  setShowPreview: (v: boolean | ((b: boolean) => boolean)) => void;
  onCopyTeleportLine?: () => void | Promise<void>;
  extras?: CommandPaletteExtras;
};

export default function CommandPaletteDialog({
  open,
  onClose,
  onPickMode,
  onPickWorkspaceTab,
  onCopyAll,
  onCopyBuildSummary,
  onCopyFirstChunk,
  showCopyFirstChunk,
  mode,
  show3D,
  setShow3D,
  showStats,
  setShowStats,
  showPreview,
  setShowPreview,
  onCopyTeleportLine,
  extras,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const items = useMemo((): PaletteItem[] => {
    const close = onClose;
    const list: PaletteItem[] = [
      {
        id: "mode-grid",
        section: "Mode",
        label: "Grid mode",
        keywords: "grid floor layout",
        onSelect: () => {
          onPickMode("grid");
          close();
        },
      },
      {
        id: "mode-shape",
        section: "Mode",
        label: "Structures mode",
        keywords: "shape structures procedural arena",
        onSelect: () => {
          onPickMode("shape");
          close();
        },
      },
      {
        id: "mode-caves",
        section: "Mode",
        label: "Caves mode",
        keywords: "caves custom import",
        onSelect: () => {
          onPickMode("caves");
          close();
        },
      },
      {
        id: "tab-design",
        section: "Workflow",
        label: "Design tab",
        keywords: "design build template",
        onSelect: () => {
          onPickWorkspaceTab("design");
          close();
        },
      },
      {
        id: "tab-placement",
        section: "Workflow",
        label: "Placement tab",
        keywords: "placement spawn teleport anchor",
        onSelect: () => {
          onPickWorkspaceTab("placement");
          close();
        },
      },
      {
        id: "tab-export",
        section: "Workflow",
        label: "Export tab",
        keywords: "export share preset download chunk",
        onSelect: () => {
          onPickWorkspaceTab("export");
          close();
        },
      },
      {
        id: "copy-all",
        section: "Clipboard",
        label: "Copy all commands",
        keywords: "copy clipboard paste",
        onSelect: () => {
          void onCopyAll();
          close();
        },
      },
      ...(showCopyFirstChunk && onCopyFirstChunk
        ? ([
            {
              id: "copy-chunk-0",
              section: "Clipboard",
              label: "Copy first paste chunk only",
              keywords: "chunk macro split paste",
              onSelect: () => {
                void onCopyFirstChunk();
                close();
              },
            },
          ] satisfies PaletteItem[])
        : []),
      {
        id: "copy-summary",
        section: "Clipboard",
        label: "Copy build summary (notes / Discord)",
        keywords: "summary discord meta",
        onSelect: () => {
          void onCopyBuildSummary();
          close();
        },
      },
      {
        id: "toggle-3d",
        section: "Preview panel",
        label: show3D ? "Hide 3D preview" : "Show 3D preview",
        keywords: "3d preview three",
        onSelect: () => {
          setShow3D(!show3D);
          close();
        },
      },
      {
        id: "toggle-stats",
        section: "Preview panel",
        label: showStats ? "Hide statistics" : "Show statistics",
        keywords: "stats footprint chunk",
        onSelect: () => {
          setShowStats(!showStats);
          close();
        },
      },
      {
        id: "toggle-preview",
        section: "Preview panel",
        label: showPreview ? "Hide command preview" : "Show command preview",
        keywords: "commands lines preview",
        onSelect: () => {
          setShowPreview(!showPreview);
          close();
        },
      },
      ...(mode !== "caves" && onCopyTeleportLine
        ? ([
            {
              id: "copy-tp",
              section: "Clipboard",
              label: "Copy teleport line only",
              keywords: "teleport tp coords getplayerpos",
              onSelect: () => {
                void onCopyTeleportLine();
                close();
              },
            },
          ] satisfies PaletteItem[])
        : []),
    ];

    if (mode !== "caves" && extras) {
      const e = extras;
      const tools: PaletteItem[] = [];
      if (e.onCopyShapeCenters) {
        tools.push({
          id: "copy-shape-xyz",
          section: "Tools",
          label: "Copy structure center X Y Z",
          keywords: "shape center coordinates clipboard",
          onSelect: () => {
            void e.onCopyShapeCenters?.();
            close();
          },
        });
      }
      if (e.onCopyTeleportNumbers) {
        tools.push({
          id: "copy-tp-xyz",
          section: "Tools",
          label: "Copy teleport X Y Z (numbers only)",
          keywords: "teleport feet coords clipboard",
          onSelect: () => {
            void e.onCopyTeleportNumbers?.();
            close();
          },
        });
      }
      if (e.onCopyWorkspaceJson) {
        tools.push({
          id: "copy-workspace-json",
          section: "Tools",
          label: "Copy workspace JSON to clipboard",
          keywords: "share json settings export",
          onSelect: () => {
            void e.onCopyWorkspaceJson?.();
            close();
          },
        });
      }
      if (e.onDownloadDiagnostics) {
        tools.push({
          id: "dl-diagnostics",
          section: "Tools",
          label: "Download diagnostics.json",
          keywords: "support bug report json",
          onSelect: () => {
            e.onDownloadDiagnostics?.();
            close();
          },
        });
      }
      if (e.onExportRecentBuildsCsv) {
        tools.push({
          id: "export-recent-csv",
          section: "Tools",
          label: "Download recent builds as CSV",
          keywords: "history csv export",
          onSelect: () => {
            e.onExportRecentBuildsCsv?.();
            close();
          },
        });
      }
      if (e.onDownloadCommandsCsv) {
        tools.push({
          id: "export-commands-csv",
          section: "Tools",
          label: "Download all commands as CSV (spreadsheet)",
          keywords: "excel commands export csv rows",
          onSelect: () => {
            e.onDownloadCommandsCsv?.();
            close();
          },
        });
      }
      if (e.onCycleReduceMotion && e.reduceMotionSummary) {
        tools.push({
          id: "cycle-reduce-motion",
          section: "Appearance",
          label: `Cycle motion preference (now: ${e.reduceMotionSummary})`,
          keywords: "animation reduce calm a11y accessibility vestibular",
          onSelect: () => {
            e.onCycleReduceMotion?.();
            close();
          },
        });
      }
      if (e.onToggleCommandLineNumbers) {
        tools.push({
          id: "toggle-cmd-line-numbers",
          section: "Appearance",
          label: e.commandLineNumbersOn ? "Hide command line numbers" : "Show command line numbers",
          keywords: "preview gutter row index",
          onSelect: () => {
            e.onToggleCommandLineNumbers?.();
            close();
          },
        });
      }
      if (e.showCopyLastPasteChunk && e.onCopyLastPasteChunk) {
        tools.push({
          id: "copy-chunk-last",
          section: "Clipboard",
          label: "Copy last paste chunk only",
          keywords: "chunk macro split paste final",
          onSelect: () => {
            void e.onCopyLastPasteChunk?.();
            close();
          },
        });
      }
      if (e.onClearPasteProgress) {
        tools.push({
          id: "clear-chunk-progress",
          section: "Tools",
          label: "Clear paste-chunk checkmarks",
          keywords: "chunks copied reset macro",
          onSelect: () => {
            e.onClearPasteProgress?.();
            close();
          },
        });
      }
      if (e.onClearTabSessionWorkspace) {
        tools.push({
          id: "clear-tab-session",
          section: "Tools",
          label: "Clear tab session snapshot (refresh restore)",
          keywords: "session storage forget",
          onSelect: () => {
            e.onClearTabSessionWorkspace?.();
            close();
          },
        });
      }
      if (mode === "grid" && e.onRandomizeGrid) {
        tools.push({
          id: "random-grid",
          section: "Tools",
          label: "Randomize grid footprint size",
          keywords: "grid max random size arena",
          onSelect: () => {
            e.onRandomizeGrid?.();
            close();
          },
        });
      }
      if (mode === "shape" && e.onResetShapePlacement) {
        tools.push({
          id: "reset-shape-place",
          section: "Tools",
          label: "Reset structure placement to preset defaults",
          keywords: "center radius step origin",
          onSelect: () => {
            e.onResetShapePlacement?.();
            close();
          },
        });
      }
      for (let i = 0; i < 3; i++) {
        const n = i + 1;
        if (e.onSaveQuickSlot) {
          tools.push({
            id: `save-slot-${i}`,
            section: "Quick slots",
            label: `Save workspace to slot ${n}`,
            keywords: `bookmark slot ${n} quick`,
            onSelect: () => {
              e.onSaveQuickSlot?.(i);
              close();
            },
          });
        }
        if (e.onRestoreQuickSlot) {
          tools.push({
            id: `restore-slot-${i}`,
            section: "Quick slots",
            label: `Restore workspace from slot ${n}`,
            keywords: `load slot ${n} quick`,
            onSelect: () => {
              e.onRestoreQuickSlot?.(i);
              close();
            },
          });
        }
        if (e.onClearQuickSlot) {
          tools.push({
            id: `clear-slot-${i}`,
            section: "Quick slots",
            label: `Clear quick slot ${n}`,
            keywords: `delete slot ${n}`,
            onSelect: () => {
              e.onClearQuickSlot?.(i);
              close();
            },
          });
        }
      }
      list.push(...tools);
    }

    return list;
  }, [
    mode,
    onClose,
    onCopyAll,
    onCopyBuildSummary,
    onCopyFirstChunk,
    onCopyTeleportLine,
    onPickMode,
    onPickWorkspaceTab,
    setShow3D,
    setShowPreview,
    setShowStats,
    show3D,
    showCopyFirstChunk,
    showPreview,
    showStats,
    extras,
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.keywords.toLowerCase().includes(q) ||
        it.section.toLowerCase().includes(q),
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const m = new Map<string, PaletteItem[]>();
    for (const it of filtered) {
      const arr = m.get(it.section) ?? [];
      arr.push(it);
      m.set(it.section, arr);
    }
    return m;
  }, [filtered]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const selectors =
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
    const focusables = Array.from(panel.querySelectorAll<HTMLElement>(selectors)).filter(
      (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", trap);
    return () => window.removeEventListener("keydown", trap);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
    >
      <div
        ref={panelRef}
        className="mx-auto mt-12 w-full max-w-xl card-ark p-4 flex flex-col max-h-[min(80vh,520px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          id="command-palette-title"
          className="flex items-center gap-2 text-sm text-primary font-display shrink-0"
        >
          <Command className="w-4 h-4" aria-hidden /> Command Palette
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 mb-2 shrink-0">
          Type to filter · Esc to close · Ctrl+K / ⌘+K toggles
        </p>
        <div className="relative shrink-0 mb-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions…"
            className="ark-input pl-8 h-9 text-xs"
            aria-label="Filter palette actions"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-ark space-y-3 pr-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No actions match “{query.trim()}”.</p>
          ) : (
            [...grouped.entries()].map(([section, rows]) => (
              <div key={section}>
                <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wide mb-1.5">{section}</p>
                <div className="space-y-1">
                  {rows.map((it) => (
                    <Button
                      key={it.id}
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-xs h-auto min-h-9 py-2 whitespace-normal text-left"
                      onClick={() => void it.onSelect()}
                    >
                      {it.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
