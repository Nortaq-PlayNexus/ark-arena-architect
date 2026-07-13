import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Box, Copy, CopyPlus, Download, MapPinned, Plus, RefreshCw, RotateCcw, Search, Terminal, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomCaveEntry, CustomCaveMap, CustomCavesPayload } from "@/lib/customCavesCatalog";
import { loadCustomCavesCatalog, loadTerrorCustomsCatalog } from "@/lib/customCavesCatalog";
import { parseCavesImport } from "@/lib/importSchemas";

const Preview3D = lazy(() => import("@/components/Preview3D"));

function parseSpiCoords(line: string): { x: number; y: number; z: number } | null {
  const m = line.match(/cheat\s+spi\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/i);
  if (!m) return null;
  return { x: Number(m[1]), y: Number(m[2]), z: Number(m[3]) };
}

function parseSetPlayerPos(line: string): { x: number; y: number; z: number } | null {
  const m = line.match(/admincheat\s+setplayerpos\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/i);
  if (!m) return null;
  return { x: Number(m[1]), y: Number(m[2]), z: Number(m[3]) };
}

function coordsFromTeleport(line: string): { x: number; y: number; z: number } | null {
  const stripped = line.trim().replace(/\s*\|\s*$/, "");
  return parseSpiCoords(stripped) ?? parseSetPlayerPos(stripped);
}

function isTeleportLine(line: string): boolean {
  const core = line.trim().replace(/\s*\|\s*$/, "").trim();
  const lower = core.toLowerCase();
  return lower.startsWith("cheat spi") || lower.startsWith("admincheat setplayerpos");
}

/** ARK console: spawn/admin lines end with | ; teleport (cheat spi / SetPlayerPos) does not. */
function normalizeArkCommandLine(line: string): string {
  const core = line.trim().replace(/\s*\|\s*$/, "").trim();
  if (!core) return "";
  if (isTeleportLine(core)) return core;
  return `${core}|`;
}

/** Ordered lines for in-game use (ARK often only runs the first line per paste). */
function getCaveCommandLines(cave: { teleportLine: string; fullCommands: string }): string[] {
  const out: string[] = [];
  if (cave.teleportLine?.trim()) out.push(normalizeArkCommandLine(cave.teleportLine));
  if (cave.fullCommands?.trim()) {
    for (const line of cave.fullCommands.split("\n")) {
      const n = normalizeArkCommandLine(line);
      if (n) out.push(n);
    }
  }
  return out;
}

function parseTrailingXYZ(line: string): { x: number; y: number; z: number } | null {
  const core = line.trim().replace(/\s*\|\s*$/, "");
  const m = core.match(/\s(-?\d+)\s+(-?\d+)\s+(-?\d+)\s*$/);
  if (!m) return null;
  const x = Number(m[1]);
  const y = Number(m[2]);
  const z = Number(m[3]);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
  return { x, y, z };
}

function isSpawnactorLine(line: string): boolean {
  const core = line.trim().replace(/\s*\|\s*$/, "").toLowerCase();
  return core.startsWith("admincheat spawnactor") || core.startsWith("cheat spawnactor");
}

/**
 * Preview-only helper:
 * Many custom cave files use spawnactor offsets around (0,0,0) relative to the TP line.
 * Convert those into world coordinates for 3D rendering while leaving saved command text untouched.
 */
function getPreviewCommandLines(cave: { teleportLine: string; fullCommands: string }): string[] {
  const raw = getCaveCommandLines(cave);
  const tp = coordsFromTeleport(cave.teleportLine ?? "");
  if (!tp) return raw;

  let spawnCount = 0;
  let maxAbs = 0;
  for (const line of raw) {
    if (!isSpawnactorLine(line)) continue;
    const xyz = parseTrailingXYZ(line);
    if (!xyz) continue;
    spawnCount += 1;
    maxAbs = Math.max(maxAbs, Math.abs(xyz.x), Math.abs(xyz.y), Math.abs(xyz.z));
  }
  // Heuristic: treat spawnactor coords as relative if they're all in a small offset range.
  const likelyRelative = spawnCount > 0 && maxAbs <= 20_000;
  if (!likelyRelative) return raw;

  return raw.map((line) => {
    if (!isSpawnactorLine(line)) return line;
    const xyz = parseTrailingXYZ(line);
    if (!xyz) return line;
    const core = line.trim().replace(/\s*\|\s*$/, "");
    const updated = core.replace(/\s-?\d+\s+-?\d+\s+-?\d+\s*$/, ` ${Math.round(tp.x + xyz.x)} ${Math.round(tp.y + xyz.y)} ${Math.round(tp.z + xyz.z)}`);
    return `${updated}|`;
  });
}

const STORAGE_LINES_PER_CHUNK = "customCaves.linesPerChunk";
const STORAGE_CUSTOM_CAVES_MAPS = "customCaves.userMaps.v1";
const STORAGE_CUSTOM_CAVES_MAPS_AUTOSAVE = "customCaves.userMaps.autosave.v1";
const STORAGE_CUSTOM_CAVES_MAPS_AUTOSAVE_AT = "customCaves.userMaps.autosaveAt.v1";
/** Keeps pasted text from overflowing the in-game console / tab (soft cap). */
const MAX_CHUNK_CHARS = 3000;
const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

const LINES_PER_CHUNK_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 20, 25, 30] as const;
const PLACEMENT_TYPES = [
  { value: "wall-terminals", label: "Wall of terminals" },
  { value: "crouch-point", label: "Crouch point" },
  { value: "custom-entrance", label: "Custom cave entrance" },
  { value: "tunnel-line", label: "Tunnel line" },
  { value: "open-room", label: "Open room" },
  { value: "other", label: "Other / mixed" },
] as const;
type PlacementType = (typeof PLACEMENT_TYPES)[number]["value"];
const DEFAULT_PLACEMENT_TYPE: PlacementType = "wall-terminals";
const SUGGEST_NONE = "__none__";
const OFFICIAL_MAP_REFERENCES = [
  {
    id: "the-island",
    name: "The Island",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/The_Island",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#The_Island",
  },
  {
    id: "scorched-earth",
    name: "Scorched Earth",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/Scorched_Earth",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#Scorched_Earth",
  },
  {
    id: "aberration",
    name: "Aberration",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/Aberration",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#Aberration",
  },
  {
    id: "extinction",
    name: "Extinction",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/Extinction",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#Extinction",
  },
  {
    id: "genesis-part-1",
    name: "Genesis: Part 1",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/Genesis:_Part_1",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#Genesis:_Part_1",
  },
  {
    id: "genesis-part-2",
    name: "Genesis: Part 2",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/Genesis:_Part_2",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#Genesis:_Part_2",
  },
  {
    id: "the-center",
    name: "The Center",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/The_Center",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#The_Center",
  },
  {
    id: "ragnarok",
    name: "Ragnarok",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/Ragnarok",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#Ragnarok",
  },
  {
    id: "valguero",
    name: "Valguero",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/Valguero",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#Valguero",
  },
  {
    id: "crystal-isles",
    name: "Crystal Isles",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/Crystal_Isles",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#Crystal_Isles",
  },
  {
    id: "lost-island",
    name: "Lost Island",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/Lost_Island",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#Lost_Island",
  },
  {
    id: "fjordur",
    name: "Fjordur",
    explorerUrl: "https://ark.wiki.gg/wiki/Explorer_Map/Fjordur",
    cavesUrl: "https://ark.wiki.gg/wiki/Caves#Fjordur",
  },
] as const;

function placementLabel(value?: string): string {
  return PLACEMENT_TYPES.find((item) => item.value === value)?.label ?? "Other / mixed";
}

function normalizePlacementType(value?: string): PlacementType {
  return (PLACEMENT_TYPES.find((item) => item.value === value)?.value ?? DEFAULT_PLACEMENT_TYPE) as PlacementType;
}

function generateWallTerminalCommands(config: {
  blueprintPath: string;
  xCount: number;
  zCount: number;
  xStep: number;
  zStep: number;
  yOffset: number;
}): string {
  const bp = config.blueprintPath.trim();
  if (!bp) return "";
  const lines: string[] = [];
  for (let xi = 0; xi < config.xCount; xi++) {
    const x = xi * config.xStep;
    for (let zi = 0; zi < config.zCount; zi++) {
      const z = zi * config.zStep;
      lines.push(`admincheat spawnactor "Blueprint'${bp}'" ${x} ${config.yOffset} ${z}|`);
    }
  }
  return lines.join("\n");
}

function readStoredLinesPerChunk(): number {
  try {
    const v = localStorage.getItem(STORAGE_LINES_PER_CHUNK);
    if (v) {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n) && (LINES_PER_CHUNK_OPTIONS as readonly number[]).includes(n)) return n;
    }
  } catch {
    /* ignore */
  }
  return 10;
}

/**
 * Takes up to maxLines lines starting at start, but stops early if the joined text would exceed maxChars
 * (so one paste doesn’t break the in-game tab / console).
 */
function takeChunk(
  lines: string[],
  start: number,
  maxLines: number,
  maxChars: number,
): { text: string; count: number } {
  if (start >= lines.length) return { text: "", count: 0 };
  const parts: string[] = [];
  let total = 0;
  for (let i = 0; i < maxLines && start + i < lines.length; i++) {
    const line = lines[start + i];
    const sep = parts.length > 0 ? 1 : 0;
    if (parts.length === 0) {
      if (line.length > maxChars) {
        return { text: line, count: 1 };
      }
      parts.push(line);
      total = line.length;
      continue;
    }
    if (total + sep + line.length > maxChars) break;
    parts.push(line);
    total += sep + line.length;
  }
  if (parts.length === 0) {
    return { text: lines[start], count: 1 };
  }
  return { text: parts.join("\n"), count: parts.length };
}

function filterMaps(maps: CustomCaveMap[], q: string) {
  if (!q) return maps;
  return maps
    .map((m) => ({
      ...m,
      caves: m.caves.filter((c) => {
        if (
          c.name.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          c.teleportLine.toLowerCase().includes(q) ||
          (c.placementType ?? "").toLowerCase().includes(q)
        )
          return true;
        if (c.fullCommands.toLowerCase().includes(q)) return true;
        return false;
      }),
    }))
    .filter((m) => m.caves.length > 0);
}

function cloneMaps(maps: CustomCaveMap[]): CustomCaveMap[] {
  return maps.map((m) => ({
    ...m,
    caves: m.caves.map((c) => ({ ...c, placementType: normalizePlacementType(c.placementType) })),
  }));
}

/**
 * Merge ingested catalog maps with locally saved maps.
 * - Catalog remains the base so displays keep full map/cave coverage.
 * - Local caves with same IDs override catalog cave fields (user edits).
 * - Local user caves are appended.
 * - Local-only maps are included.
 */
function mergeCatalogWithStored(catalog: CustomCaveMap[], stored: CustomCaveMap[] | null): CustomCaveMap[] {
  const catalogClone = cloneMaps(catalog);
  if (!stored || stored.length === 0) return catalogClone;

  const byMapId = new Map<string, CustomCaveMap>();
  for (const m of catalogClone) byMapId.set(m.id, { ...m, caves: [...m.caves] });

  for (const localMap of stored) {
    const existing = byMapId.get(localMap.id);
    if (!existing) {
      byMapId.set(localMap.id, {
        ...localMap,
        caves: localMap.caves.map((c) => ({ ...c, placementType: normalizePlacementType(c.placementType) })),
      });
      continue;
    }

    const caveById = new Map(existing.caves.map((c) => [c.id, c] as const));
    for (const localCave of localMap.caves) {
      const normalizedLocal = { ...localCave, placementType: normalizePlacementType(localCave.placementType) };
      caveById.set(localCave.id, normalizedLocal);
    }
    existing.name = localMap.name || existing.name;
    existing.caves = Array.from(caveById.values());
  }

  return Array.from(byMapId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function readStoredMaps(): CustomCaveMap[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_CAVES_MAPS);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomCaveMap[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function sanitizeMaps(payload: unknown): CustomCaveMap[] | null {
  return parseCavesImport(payload);
}

export default function CustomCavesPanel() {
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [cavesBootstrap] = useState(() => {
    const stored = readStoredMaps();
    const maps = stored ?? [];
    return {
      maps,
      catalogLoading: maps.length === 0,
      sourceDir: maps.length > 0 ? "Local cache" : "loading…",
    };
  });
  const [sourceDir, setSourceDir] = useState(cavesBootstrap.sourceDir);
  const [catalogLoading, setCatalogLoading] = useState(cavesBootstrap.catalogLoading);
  const [catalogLoadError, setCatalogLoadError] = useState<string | null>(null);
  const [sourceMaps, setSourceMaps] = useState<CustomCaveMap[]>([]);
  const [maps, setMaps] = useState<CustomCaveMap[]>(cavesBootstrap.maps);
  const [terrorMaps, setTerrorMaps] = useState<CustomCaveMap[]>([]);
  /** Next line index per cave for chunked copy (teleport + terminals in one queue). */
  const [commandStepByCave, setCommandStepByCave] = useState<Record<string, number>>({});
  /** Lines per paste; 1 = one line at a time, 6+ = teleport + several spawnactors in one copy when it fits under the char cap. */
  const [linesPerChunk, setLinesPerChunk] = useState(readStoredLinesPerChunk);
  /** Full raw commands for the currently previewed cave (teleport + all terminals). */
  const [previewSourceCommands, setPreviewSourceCommands] = useState<string[]>([]);
  /** Filtered commands actually rendered in 3D (per-cave doorways / removed terminals). */
  const [previewCommands, setPreviewCommands] = useState<string[]>([]);
  const [previewLabel, setPreviewLabel] = useState("");
  const [previewCaveId, setPreviewCaveId] = useState<string | null>(null);
  /** For each preview command, which original index it came from (needed so clicks map back to the ingest list). */
  const [previewIndexMap, setPreviewIndexMap] = useState<number[]>([]);
  /** Per-cave set of hidden command indices (clicked out in preview to form doorways, tunnels, etc.). */
  const [hiddenByCave, setHiddenByCave] = useState<Record<string, Set<number>>>({});
  const [newMapName, setNewMapName] = useState("");
  const [newMapId, setNewMapId] = useState("custom-user-map");
  const [newCaveName, setNewCaveName] = useState("");
  const [selectedSuggestedMapId, setSelectedSuggestedMapId] = useState(SUGGEST_NONE);
  const [selectedSuggestedCaveKey, setSelectedSuggestedCaveKey] = useState(SUGGEST_NONE);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [officialMapRefId, setOfficialMapRefId] = useState<string>(OFFICIAL_MAP_REFERENCES[0].id);
  const [mapSuggestionQuery, setMapSuggestionQuery] = useState("");
  const [caveSuggestionQuery, setCaveSuggestionQuery] = useState("");
  const [newTeleportLine, setNewTeleportLine] = useState("");
  const [newPlacementType, setNewPlacementType] = useState<PlacementType>(DEFAULT_PLACEMENT_TYPE);
  const [wallBlueprintPath, setWallBlueprintPath] = useState(
    "/Game/PrimalEarth/Structures/TributeTerminal_Base.TributeTerminal_Base",
  );
  const [wallXCount, setWallXCount] = useState("10");
  const [wallZCount, setWallZCount] = useState("15");
  const [wallXStep, setWallXStep] = useState("300");
  const [wallZStep, setWallZStep] = useState("500");
  const [wallYOffset, setWallYOffset] = useState("0");
  const [teleportCmdType, setTeleportCmdType] = useState<"cheat spi" | "admincheat setplayerpos">("admincheat setplayerpos");
  const [teleportX, setTeleportX] = useState("");
  const [teleportY, setTeleportY] = useState("");
  const [teleportZ, setTeleportZ] = useState("");
  const [newFullCommands, setNewFullCommands] = useState("");
  const importFileRef = useRef<HTMLInputElement | null>(null);
  const [editingCaveId, setEditingCaveId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlacementType, setEditPlacementType] = useState<PlacementType>(DEFAULT_PLACEMENT_TYPE);
  const [editTeleportLine, setEditTeleportLine] = useState("");
  const [editFullCommands, setEditFullCommands] = useState("");
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [editMapName, setEditMapName] = useState("");
  const [lastDeletedCave, setLastDeletedCave] = useState<{
    mapId: string;
    mapName: string;
    cave: CustomCaveEntry;
    index: number;
  } | null>(null);
  const [finishedVisibleMaps, setFinishedVisibleMaps] = useState(24);
  const [terrorVisibleMaps, setTerrorVisibleMaps] = useState(24);
  const [autosaveAt, setAutosaveAt] = useState<number | null>(null);

  const loadCatalog = useCallback(async () => {
    const cached = readStoredMaps();
    if (cached == null || cached.length === 0) {
      setCatalogLoading(true);
    }
    setCatalogLoadError(null);
    try {
      const [payload, terrorPayload] = await Promise.all([
        loadCustomCavesCatalog(),
        loadTerrorCustomsCatalog().catch(() => null),
      ]);
      setSourceDir(terrorPayload?.sourceDir ? `${payload.sourceDir} + ${terrorPayload.sourceDir}` : payload.sourceDir);
      const catalogMaps = cloneMaps(payload.maps);
      setSourceMaps(catalogMaps);
      const stored = readStoredMaps();
      setMaps(mergeCatalogWithStored(catalogMaps, stored));
      setTerrorMaps(cloneMaps(terrorPayload?.maps ?? []));
    } catch {
      setSourceDir("unavailable");
      setSourceMaps([]);
      setMaps(readStoredMaps() ?? []);
      setTerrorMaps([]);
      setCatalogLoadError("Could not load cave catalog chunk. You can still use locally saved caves.");
      toast.error("Could not load cave catalog");
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  // Load cave catalog lazily so this large dataset doesn't inflate the main app shell bundle.
  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LINES_PER_CHUNK, String(linesPerChunk));
    } catch {
      /* ignore */
    }
  }, [linesPerChunk]);

  useEffect(() => {
    try {
      const prev = localStorage.getItem(STORAGE_CUSTOM_CAVES_MAPS);
      if (prev) {
        localStorage.setItem(STORAGE_CUSTOM_CAVES_MAPS_AUTOSAVE, prev);
        const now = Date.now();
        localStorage.setItem(STORAGE_CUSTOM_CAVES_MAPS_AUTOSAVE_AT, String(now));
        setAutosaveAt(now);
      }
      localStorage.setItem(STORAGE_CUSTOM_CAVES_MAPS, JSON.stringify(maps));
    } catch {
      /* ignore */
    }
  }, [maps]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_CUSTOM_CAVES_MAPS_AUTOSAVE_AT);
    const n = raw ? Number(raw) : NaN;
    if (Number.isFinite(n)) setAutosaveAt(n);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedFilter(filter), 140);
    return () => window.clearTimeout(t);
  }, [filter]);

  useEffect(() => {
    const xyz = coordsFromTeleport(newTeleportLine);
    if (!xyz) return;
    setTeleportX(String(xyz.x));
    setTeleportY(String(xyz.y));
    setTeleportZ(String(xyz.z));
  }, [newTeleportLine]);

  const filteredFinished = useMemo(
    () => filterMaps(maps, debouncedFilter.trim().toLowerCase()),
    [maps, debouncedFilter],
  );
  const visibleFinishedMaps = useMemo(() => filteredFinished.slice(0, finishedVisibleMaps), [filteredFinished, finishedVisibleMaps]);
  const filteredTerror = useMemo(
    () => filterMaps(terrorMaps, debouncedFilter.trim().toLowerCase()),
    [terrorMaps, debouncedFilter],
  );
  const visibleTerrorMaps = useMemo(() => filteredTerror.slice(0, terrorVisibleMaps), [filteredTerror, terrorVisibleMaps]);

  useEffect(() => {
    setFinishedVisibleMaps(24);
    setTerrorVisibleMaps(24);
  }, [debouncedFilter]);
  const caveCount = useMemo(() => maps.reduce((sum, m) => sum + m.caves.length, 0), [maps]);
  const terrorCaveCount = useMemo(() => terrorMaps.reduce((sum, m) => sum + m.caves.length, 0), [terrorMaps]);
  const totalMapCount = maps.length + terrorMaps.length;
  const totalCaveCount = caveCount + terrorCaveCount;
  const suggestionMapsBase = useMemo(() => {
    // Suggest from active ingested datasets (standard + terror).
    // If both are empty (ingest not run yet), fall back to current local maps so UI is never blank.
    const merged = [...sourceMaps, ...terrorMaps];
    if (merged.length === 0) return maps;
    const byId = new Map<string, CustomCaveMap>();
    for (const m of merged) {
      if (!byId.has(m.id)) byId.set(m.id, m);
    }
    return [...byId.values()];
  }, [sourceMaps, terrorMaps, maps]);
  const mapIdSuggestions = useMemo(
    () => suggestionMapsBase.map((m) => m.id).sort((a, b) => a.localeCompare(b)),
    [suggestionMapsBase],
  );
  const mapSuggestions = useMemo(
    () => [...suggestionMapsBase].sort((a, b) => a.name.localeCompare(b.name)).map((m) => ({ id: m.id, name: m.name })),
    [suggestionMapsBase],
  );
  const filteredMapSuggestions = useMemo(() => {
    const q = mapSuggestionQuery.trim().toLowerCase();
    if (!q) return mapSuggestions;
    return mapSuggestions.filter((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));
  }, [mapSuggestionQuery, mapSuggestions]);
  const selectedMapForCaveSuggestions = useMemo(
    () => (selectedSuggestedMapId !== SUGGEST_NONE ? selectedSuggestedMapId : newMapId.trim().toLowerCase().replace(/\s+/g, "-")),
    [newMapId, selectedSuggestedMapId],
  );
  const selectedMapObject = useMemo(
    () => suggestionMapsBase.find((m) => m.id === selectedMapForCaveSuggestions) ?? null,
    [selectedMapForCaveSuggestions, suggestionMapsBase],
  );
  const caveSuggestions = useMemo(() => {
    const selectedMap = selectedMapObject;
    if (!selectedMap) return [];
    return selectedMap.caves
      .filter((c) => c.id.startsWith("user-"))
      .map((c) => ({
        key: `${selectedMap.id}::${c.id}`,
        mapId: selectedMap.id,
        mapName: selectedMap.name,
        cave: c,
      }))
      .sort((a, b) => a.cave.name.localeCompare(b.cave.name));
  }, [selectedMapObject]);
  const filteredCaveSuggestions = useMemo(() => {
    const q = caveSuggestionQuery.trim().toLowerCase();
    if (!q) return caveSuggestions;
    return caveSuggestions.filter((c) => c.cave.name.toLowerCase().includes(q));
  }, [caveSuggestionQuery, caveSuggestions]);
  const selectedEditTarget = useMemo(() => {
    if (formMode !== "edit" || selectedSuggestedCaveKey === SUGGEST_NONE) return null;
    const [mapId, caveId] = selectedSuggestedCaveKey.split("::");
    if (!mapId || !caveId) return null;
    return { mapId, caveId };
  }, [formMode, selectedSuggestedCaveKey]);
  const selectedOfficialMapRef = useMemo(
    () => OFFICIAL_MAP_REFERENCES.find((m) => m.id === officialMapRefId) ?? OFFICIAL_MAP_REFERENCES[0],
    [officialMapRefId],
  );

  const applySuggestedMap = (mapId: string) => {
    const selected = suggestionMapsBase.find((m) => m.id === mapId);
    if (!selected) return;
    setNewMapId(selected.id);
    setNewMapName(selected.name);
    setSelectedSuggestedCaveKey(SUGGEST_NONE);
    setCaveSuggestionQuery("");
    setFormMode("add");
  };

  const applySuggestedCave = (key: string) => {
    const selected = caveSuggestions.find((item) => item.key === key);
    if (!selected) return;
    setSelectedSuggestedMapId(selected.mapId);
    setNewMapId(selected.mapId);
    setNewMapName(selected.mapName);
    setNewCaveName(selected.cave.name);
    setNewPlacementType(normalizePlacementType(selected.cave.placementType));
    setNewTeleportLine(selected.cave.teleportLine);
    setNewFullCommands(selected.cave.fullCommands);
    setFormMode("edit");
  };

  const duplicateSelectedIntoAddMode = () => {
    if (!selectedEditTarget) return;
    setSelectedSuggestedCaveKey(SUGGEST_NONE);
    setFormMode("add");
    setNewCaveName((prev) => (prev.trim() ? `${prev} Copy` : "New Cave Copy"));
    toast.success("Loaded selected cave as a new copy");
  };

  const previewSelectedCave = () => {
    if (!selectedEditTarget) return;
    const map = maps.find((m) => m.id === selectedEditTarget.mapId) ?? suggestionMapsBase.find((m) => m.id === selectedEditTarget.mapId);
    const cave = map?.caves.find((c) => c.id === selectedEditTarget.caveId);
    if (!map || !cave) {
      toast.error("Selected cave not found");
      return;
    }
    loadCavePreview(map.name, cave);
  };

  const addCave = () => {
    const caveName = newCaveName.trim();
    const coordsReady = teleportX.trim() !== "" && teleportY.trim() !== "" && teleportZ.trim() !== "";
    const builtTeleport = coordsReady
      ? `${teleportCmdType} ${teleportX.trim()} ${teleportY.trim()} ${teleportZ.trim()}`
      : "";
    const teleportLine = newTeleportLine.trim() || builtTeleport;
    const fullCommands = newFullCommands
      .split("\n")
      .map((line) => normalizeArkCommandLine(line))
      .filter(Boolean)
      .join("\n");
    if (!newMapId.trim() || !caveName) {
      toast.error("Map and cave name are required");
      return;
    }
    if (!teleportLine && !fullCommands) {
      toast.error("Add a teleport or command lines");
      return;
    }
    const targetMapId = newMapId.trim().toLowerCase().replace(/\s+/g, "-");
    const targetMapName = newMapName.trim() || targetMapId;
    if (selectedEditTarget) {
      if (targetMapId !== selectedEditTarget.mapId) {
        toast.error("Map cannot be changed in edit mode — switch to Add mode for a new cave");
        return;
      }
      setMaps((prev) =>
        prev.map((m) => {
          if (m.id !== selectedEditTarget.mapId) return m;
          return {
            ...m,
            caves: m.caves.map((c) =>
              c.id === selectedEditTarget.caveId
                ? {
                    ...c,
                    name: caveName,
                    placementType: newPlacementType,
                    teleportLine: teleportLine,
                    fullCommands: fullCommands,
                  }
                : c,
            ),
          };
        }),
      );
      if (previewCaveId === selectedEditTarget.caveId) {
        const visible: string[] = [];
        const idxMap: number[] = [];
        const hidden = hiddenByCave[selectedEditTarget.caveId];
        getCaveCommandLines({ teleportLine: teleportLine, fullCommands: fullCommands }).forEach((line, idx) => {
          if (!hidden || !hidden.has(idx)) {
            visible.push(line);
            idxMap.push(idx);
          }
        });
        setPreviewSourceCommands(getCaveCommandLines({ teleportLine: teleportLine, fullCommands: fullCommands }));
        setPreviewCommands(visible);
        setPreviewIndexMap(idxMap);
      }
      toast.success(`Updated cave: ${caveName}`);
    } else {
      const caveId = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const existingNames = maps
        .find((m) => m.id === targetMapId)
        ?.caves.map((c) => c.name.toLowerCase()) ?? [];
      const safeName = existingNames.includes(caveName.toLowerCase()) ? `${caveName} Copy` : caveName;
      const entry: CustomCaveEntry = {
        id: caveId,
        fileName: `${targetMapId}.txt`,
        name: safeName,
        placementType: newPlacementType,
        teleportLine: teleportLine,
        fullCommands: fullCommands,
      };
      setMaps((prev) => {
        const existing = prev.find((m) => m.id === targetMapId);
        if (existing) {
          return prev.map((m) => (m.id === targetMapId ? { ...m, caves: [...m.caves, entry] } : m));
        }
        return [...prev, { id: targetMapId, name: targetMapName, caves: [entry] }];
      });
      toast.success(`Added cave: ${safeName}`);
    }
    setNewCaveName("");
    setNewTeleportLine("");
    setNewPlacementType(DEFAULT_PLACEMENT_TYPE);
    setTeleportX("");
    setTeleportY("");
    setTeleportZ("");
    setNewFullCommands("");
    setSelectedSuggestedCaveKey(SUGGEST_NONE);
    setFormMode("add");
  };

  const resetAddCaveForm = () => {
    setNewMapName("");
    setNewMapId("custom-user-map");
    setNewCaveName("");
    setSelectedSuggestedMapId(SUGGEST_NONE);
    setSelectedSuggestedCaveKey(SUGGEST_NONE);
    setFormMode("add");
    setMapSuggestionQuery("");
    setCaveSuggestionQuery("");
    setNewTeleportLine("");
    setNewPlacementType(DEFAULT_PLACEMENT_TYPE);
    setTeleportCmdType("admincheat setplayerpos");
    setTeleportX("");
    setTeleportY("");
    setTeleportZ("");
    setNewFullCommands("");
  };

  const applyTeleportCoords = () => {
    if (!teleportX.trim() || !teleportY.trim() || !teleportZ.trim()) {
      toast.error("Enter X, Y, and Z first");
      return;
    }
    const built = `${teleportCmdType} ${teleportX.trim()} ${teleportY.trim()} ${teleportZ.trim()}`;
    setNewTeleportLine(built);
    toast.success("Teleport command generated from coordinates");
  };

  const applyWallPreset = () => {
    const xCount = Number.parseInt(wallXCount, 10);
    const zCount = Number.parseInt(wallZCount, 10);
    const xStep = Number.parseFloat(wallXStep);
    const zStep = Number.parseFloat(wallZStep);
    const yOffset = Number.parseFloat(wallYOffset);
    if (!wallBlueprintPath.trim()) {
      toast.error("Enter a blueprint path");
      return;
    }
    if (!Number.isFinite(xCount) || xCount < 1 || !Number.isFinite(zCount) || zCount < 1) {
      toast.error("Columns and rows must be at least 1");
      return;
    }
    if (!Number.isFinite(xStep) || !Number.isFinite(zStep) || xStep <= 0 || zStep <= 0) {
      toast.error("Step values must be greater than 0");
      return;
    }
    if (!Number.isFinite(yOffset)) {
      toast.error("Y offset must be a number");
      return;
    }
    const commands = generateWallTerminalCommands({
      blueprintPath: wallBlueprintPath,
      xCount,
      zCount,
      xStep,
      zStep,
      yOffset,
    });
    if (!commands) {
      toast.error("Could not build wall commands");
      return;
    }
    setNewFullCommands(commands);
    toast.success(`Generated ${xCount * zCount} wall terminal commands`);
  };

  const deleteCave = (mapId: string, mapName: string, caveId: string, caveName: string) => {
    const ok = window.confirm(`Delete cave "${caveName}" from map "${mapName}"?`);
    if (!ok) return;
    setMaps((prev) => {
      let deletedCave: CustomCaveEntry | null = null;
      let deletedIndex = -1;
      const next = prev
        .map((m) => {
          if (m.id !== mapId) return m;
          const idx = m.caves.findIndex((c) => c.id === caveId);
          if (idx >= 0) {
            deletedCave = m.caves[idx];
            deletedIndex = idx;
          }
          return { ...m, caves: m.caves.filter((c) => c.id !== caveId) };
        })
        .filter((m) => m.caves.length > 0);
      if (deletedCave && deletedIndex >= 0) {
        setLastDeletedCave({ mapId, mapName, cave: deletedCave, index: deletedIndex });
      }
      return next;
    });
    setCommandStepByCave((prev) => {
      const next = { ...prev };
      delete next[caveId];
      return next;
    });
    setHiddenByCave((prev) => {
      const next = { ...prev };
      delete next[caveId];
      return next;
    });
    if (previewCaveId === caveId) {
      setPreviewCaveId(null);
      setPreviewLabel("");
      setPreviewSourceCommands([]);
      setPreviewCommands([]);
      setPreviewIndexMap([]);
    }
    toast.success(`Deleted cave: ${caveName}`);
  };

  const undoDeleteCave = () => {
    if (!lastDeletedCave) return;
    const payload = lastDeletedCave;
    setMaps((prev) => {
      const exists = prev.find((m) => m.id === payload.mapId);
      if (!exists) {
        return [...prev, { id: payload.mapId, name: payload.mapName, caves: [payload.cave] }];
      }
      return prev.map((m) => {
        if (m.id !== payload.mapId) return m;
        const caves = [...m.caves];
        const idx = Math.max(0, Math.min(payload.index, caves.length));
        caves.splice(idx, 0, payload.cave);
        return { ...m, caves };
      });
    });
    setLastDeletedCave(null);
    toast.success(`Restored cave: ${payload.cave.name}`);
  };

  const duplicateCave = (mapId: string, cave: CustomCaveEntry) => {
    const newId = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    setMaps((prev) =>
      prev.map((m) => {
        if (m.id !== mapId) return m;
        let name = `${cave.name} Copy`;
        const existing = new Set(m.caves.map((c) => c.name));
        let n = 2;
        while (existing.has(name)) {
          name = `${cave.name} Copy ${n++}`;
        }
        const copy: CustomCaveEntry = { ...cave, id: newId, name };
        return { ...m, caves: [...m.caves, copy] };
      }),
    );
    toast.success(`Duplicated cave: ${cave.name}`);
  };

  const beginEditCave = (cave: CustomCaveEntry) => {
    setEditingCaveId(cave.id);
    setEditName(cave.name);
    setEditPlacementType(normalizePlacementType(cave.placementType));
    setEditTeleportLine(cave.teleportLine);
    setEditFullCommands(cave.fullCommands);
  };

  const cancelEditCave = () => {
    setEditingCaveId(null);
    setEditName("");
    setEditPlacementType(DEFAULT_PLACEMENT_TYPE);
    setEditTeleportLine("");
    setEditFullCommands("");
  };

  const saveEditCave = (mapId: string, caveId: string) => {
    const name = editName.trim();
    const teleport = editTeleportLine.trim();
    const full = editFullCommands
      .split("\n")
      .map((line) => normalizeArkCommandLine(line))
      .filter(Boolean)
      .join("\n");
    if (!name) {
      toast.error("Cave name is required");
      return;
    }
    if (!teleport && !full) {
      toast.error("Add a teleport or command lines");
      return;
    }
    setMaps((prev) =>
      prev.map((m) => {
        if (m.id !== mapId) return m;
        return {
          ...m,
          caves: m.caves.map((c) =>
            c.id === caveId
              ? {
                  ...c,
                  name,
                  placementType: editPlacementType,
                  teleportLine: teleport,
                  fullCommands: full,
                }
              : c,
          ),
        };
      }),
    );
    if (previewCaveId === caveId) {
      const visible: string[] = [];
      const idxMap: number[] = [];
      const hidden = hiddenByCave[caveId];
      const previewLines = getPreviewCommandLines({ teleportLine: teleport, fullCommands: full });
      previewLines.forEach((line, idx) => {
        if (!hidden || !hidden.has(idx)) {
          visible.push(line);
          idxMap.push(idx);
        }
      });
      setPreviewSourceCommands(previewLines);
      setPreviewCommands(visible);
      setPreviewIndexMap(idxMap);
    }
    cancelEditCave();
    toast.success("Cave updated");
  };

  const beginEditMap = (map: CustomCaveMap) => {
    setEditingMapId(map.id);
    setEditMapName(map.name);
  };

  const cancelEditMap = () => {
    setEditingMapId(null);
    setEditMapName("");
  };

  const saveEditMap = (mapId: string) => {
    const nextName = editMapName.trim();
    if (!nextName) {
      toast.error("Map name is required");
      return;
    }
    setMaps((prev) => prev.map((m) => (m.id === mapId ? { ...m, name: nextName } : m)));
    cancelEditMap();
    toast.success("Map renamed");
  };

  const exportCavesBackup = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        mapCount: maps.length,
        caveCount,
        maps,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `custom-caves-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exported");
    } catch {
      toast.error("Could not export backup");
    }
  };

  const importCavesBackup = async (file: File) => {
    try {
      if (file.size > MAX_IMPORT_BYTES) {
        toast.error("Backup file is too large (max 8MB)");
        return;
      }
      const text = await file.text();
      const parsed = JSON.parse(text) as { maps?: unknown } | unknown;
      const mapsPayload = (parsed as { maps?: unknown })?.maps ?? parsed;
      const sane = sanitizeMaps(mapsPayload);
      if (!sane) {
        toast.error("Invalid backup format");
        return;
      }
      setMaps(sane);
      setHiddenByCave({});
      setCommandStepByCave({});
      setPreviewCaveId(null);
      setPreviewLabel("");
      setPreviewSourceCommands([]);
      setPreviewCommands([]);
      setPreviewIndexMap([]);
      toast.success("Backup imported");
    } catch {
      toast.error("Failed to import backup");
    }
  };

  const resetAllToIngested = () => {
    if (sourceMaps.length === 0) {
      toast.error("Ingested source not loaded yet");
      return;
    }
    const ok = window.confirm("Reset all cave edits to ingested defaults?");
    if (!ok) return;
    setMaps(cloneMaps(sourceMaps));
    setHiddenByCave({});
    setCommandStepByCave({});
    setPreviewCaveId(null);
    setPreviewLabel("");
    setPreviewSourceCommands([]);
    setPreviewCommands([]);
    setPreviewIndexMap([]);
    toast.success("Reset to ingested cave data");
  };

  const restoreAutosaveMaps = () => {
    try {
      const raw = localStorage.getItem(STORAGE_CUSTOM_CAVES_MAPS_AUTOSAVE);
      if (!raw) {
        toast.error("No autosave snapshot available");
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      const sane = sanitizeMaps(parsed);
      if (!sane) {
        toast.error("Autosave snapshot is invalid");
        return;
      }
      setMaps(sane);
      const rawTs = localStorage.getItem(STORAGE_CUSTOM_CAVES_MAPS_AUTOSAVE_AT);
      const n = rawTs ? Number(rawTs) : NaN;
      if (Number.isFinite(n)) setAutosaveAt(n);
      toast.success("Restored caves from autosave snapshot");
    } catch {
      toast.error("Failed to restore autosave snapshot");
    }
  };

  const clearAllDoorwayEdits = () => {
    if (Object.keys(hiddenByCave).length === 0) return;
    const ok = window.confirm("Clear all doorway edits for every cave?");
    if (!ok) return;
    setHiddenByCave({});
    if (previewSourceCommands.length > 0) {
      setPreviewCommands(previewSourceCommands);
      setPreviewIndexMap(previewSourceCommands.map((_, idx) => idx));
    }
    toast.success("Cleared all doorway edits");
  };

  const copyText = async (text: string, label: string, emptyMsg = "Nothing to copy") => {
    if (!text?.trim()) {
      toast.error(emptyMsg);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied: ${label}`);
    } catch {
      toast.error("Clipboard denied — copy failed");
    }
  };

  const copyNextChunk = async (caveId: string, lines: string[]) => {
    if (lines.length === 0) {
      toast.error("No commands in data");
      return;
    }
    const step = commandStepByCave[caveId] ?? 0;
    if (step >= lines.length) {
      toast.message("End of list — press Reset queue to start over", { duration: 3500 });
      return;
    }
    const { text, count } = takeChunk(lines, step, linesPerChunk, MAX_CHUNK_CHARS);
    if (!text.trim()) {
      toast.error("Nothing to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const idx = LINES_PER_CHUNK_OPTIONS.indexOf(linesPerChunk as (typeof LINES_PER_CHUNK_OPTIONS)[number]);
      if (idx > 0) setLinesPerChunk(LINES_PER_CHUNK_OPTIONS[idx - 1]);
      toast.error("Clipboard denied — copy failed");
      return;
    }
    const end = step + count;
    toast.success(
      `Copied lines ${step + 1}–${end} of ${lines.length} (${count} line${count === 1 ? "" : "s"}) — paste in console, then Copy next chunk`,
    );
    setCommandStepByCave((prev) => ({ ...prev, [caveId]: end }));
    if (count === linesPerChunk && text.length < MAX_CHUNK_CHARS * 0.45) {
      const idx = LINES_PER_CHUNK_OPTIONS.indexOf(linesPerChunk as (typeof LINES_PER_CHUNK_OPTIONS)[number]);
      if (idx >= 0 && idx < LINES_PER_CHUNK_OPTIONS.length - 1) {
        setLinesPerChunk(LINES_PER_CHUNK_OPTIONS[idx + 1]);
      }
    }
  };

  const resetCommandQueue = (caveId: string) => {
    setCommandStepByCave((prev) => ({ ...prev, [caveId]: 0 }));
    toast.success("Queue reset — next chunk starts at teleport");
  };

  const skipTeleportInQueue = (caveId: string, hasTeleport: boolean) => {
    if (!hasTeleport) return;
    setCommandStepByCave((prev) => ({ ...prev, [caveId]: 1 }));
    toast.success("Queue skipped to terminal lines (first spawnactor)");
  };

  const loadCavePreview = (mapName: string, cave: CustomCaveEntry) => {
    const rawLines = getPreviewCommandLines(cave);
    setPreviewSourceCommands(rawLines);
    setPreviewCaveId(cave.id);
    const hidden = hiddenByCave[cave.id];
    const visible: string[] = [];
    const indexMap: number[] = [];
    rawLines.forEach((line, idx) => {
      if (!hidden || !hidden.has(idx)) {
        visible.push(line);
        indexMap.push(idx);
      }
    });
    setPreviewCommands(visible);
    setPreviewIndexMap(indexMap);
    setPreviewLabel(`${mapName} — ${cave.name}`);
    if (visible.length === 0) {
      toast.message("No lines with coordinates to preview for this cave", { duration: 3000 });
    } else {
      toast.success("3D preview loaded");
    }
  };

  const handlePreviewPointClick = (originalIndex: number) => {
    if (!previewCaveId) return;
    const caveId = previewCaveId;
    const source = previewSourceCommands;
    setHiddenByCave((prev) => {
      const existing = prev[caveId];
      const next = new Set<number>(existing ? Array.from(existing) : []);
      if (next.has(originalIndex)) next.delete(originalIndex);
      else next.add(originalIndex);
      const visible: string[] = [];
      const indexMap: number[] = [];
      source.forEach((line, idx) => {
        if (!next.has(idx)) {
          visible.push(line);
          indexMap.push(idx);
        }
      });
      setPreviewCommands(visible);
      setPreviewIndexMap(indexMap);
      return { ...prev, [caveId]: next };
    });
  };

  const resetHiddenForCurrentPreview = () => {
    if (!previewCaveId) return;
    setHiddenByCave((prev) => {
      if (!prev[previewCaveId]) return prev;
      const { [previewCaveId]: _omit, ...rest } = prev;
      return rest;
    });
    setPreviewCommands(previewSourceCommands);
    setPreviewIndexMap(previewSourceCommands.map((_, idx) => idx));
  };

  const renderCaveRow = (map: CustomCaveMap, cave: CustomCaveEntry, keyPrefix = "") => {
    const isReadOnlySection = keyPrefix === "terror-";
    const xyz = coordsFromTeleport(cave.teleportLine);
    const rawLines = getCaveCommandLines(cave);
    const hidden = hiddenByCave[cave.id];
    const commandLines = hidden ? rawLines.filter((_, idx) => !hidden.has(idx)) : rawLines;
    const allBlock = commandLines.join("\n");
    const teleportLineDisplay = cave.teleportLine?.trim()
      ? commandLines[0] ?? cave.teleportLine.trim()
      : "";
    const terminalPreview =
      cave.teleportLine?.trim() && commandLines.length > 1
        ? commandLines.slice(1).join("\n")
        : !cave.teleportLine?.trim() && commandLines.length > 0
          ? commandLines.join("\n")
          : "";
    const step = commandStepByCave[cave.id] ?? 0;
    const nextPreview = takeChunk(commandLines, step, linesPerChunk, MAX_CHUNK_CHARS);
    const done = commandLines.length > 0 && step >= commandLines.length;
    const chunkHint =
      commandLines.length > 0 && !done
        ? `${nextPreview.count} line${nextPreview.count === 1 ? "" : "s"} · ${step + 1}–${step + nextPreview.count} / ${commandLines.length}`
        : commandLines.length > 0
          ? `done · ${commandLines.length} total`
          : "";
    return (
      <li
        key={`${keyPrefix}${cave.id}`}
        className="rounded-md border border-border/60 bg-secondary/20 px-3 py-2 text-xs space-y-2"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="min-w-0 space-y-1">
            {editingCaveId === cave.id ? (
              <>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Cave name"
                  className="ark-input h-8 text-xs"
                />
                <Select value={editPlacementType} onValueChange={(v) => setEditPlacementType(v as PlacementType)}>
                  <SelectTrigger className="h-8 text-xs ark-input">
                    <SelectValue placeholder="Placement type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACEMENT_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={editTeleportLine}
                  onChange={(e) => setEditTeleportLine(e.target.value)}
                  placeholder="Teleport line"
                  className="ark-input h-8 text-xs font-mono"
                />
              </>
            ) : (
              <>
                <p className="font-display text-foreground text-[13px]">{cave.name}</p>
                <p className="text-[10px] text-primary/90">{placementLabel(cave.placementType)}</p>
                <p className="font-mono text-[10px] text-muted-foreground break-all mt-0.5">
                  {teleportLineDisplay || "(no teleport line found)"}
                </p>
              </>
            )}
            {xyz && (
              <p className="text-[10px] text-neon-cyan mt-1 font-mono">
                X {Math.round(xyz.x)} · Y {Math.round(xyz.y)} · Z {Math.round(xyz.z)}
              </p>
            )}
            {!!hidden?.size && (
              <p className="text-[10px] text-amber-300/90 mt-1">
                Hidden from preview/copy: {hidden.size}
              </p>
            )}
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-1.5 shrink-0 min-w-[11rem]">
            <div className="flex flex-wrap gap-2 justify-end">
              {editingCaveId === cave.id ? (
                <>
                  <Button type="button" variant="neon" size="sm" className="font-display" onClick={() => saveEditCave(map.id, cave.id)}>
                    Save
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="font-display" onClick={cancelEditCave}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-display text-[10px]"
                  onClick={() => loadCavePreview(map.name, cave)}
                >
                  <Box className="w-3 h-3" /> 3D preview
                </Button>
              )}
              <Button
                type="button"
                variant="default"
                size="sm"
                className="font-display bg-primary"
                disabled={commandLines.length === 0 || done}
                onClick={() => void copyNextChunk(cave.id, commandLines)}
                title={`Copies up to ${linesPerChunk} lines (capped at ${MAX_CHUNK_CHARS} chars)`}
              >
                <Copy className="w-3 h-3" /> Copy next chunk
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-display"
                disabled={commandLines.length === 0}
                onClick={() => resetCommandQueue(cave.id)}
              >
                Reset queue
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-display"
                disabled={!cave.teleportLine || commandLines.length < 2}
                onClick={() => skipTeleportInQueue(cave.id, !!cave.teleportLine?.trim())}
                title="If you already teleported, start Copy next at the first spawnactor line"
              >
                Skip teleport
              </Button>
              <Button
                type="button"
                variant="neon"
                size="sm"
                className="font-display"
                disabled={!cave.teleportLine}
                onClick={() =>
                  void copyText(
                    teleportLineDisplay || cave.teleportLine,
                    `${cave.name} — teleport`,
                  )
                }
              >
                <Copy className="w-3 h-3" /> Copy teleport
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="font-display"
                disabled={!cave.fullCommands?.trim() && !cave.teleportLine}
                onClick={() =>
                  void copyText(allBlock, `${cave.name} — full`, "No commands in data — run ingest:caves")
                }
              >
                <Terminal className="w-3 h-3" /> Copy all commands
              </Button>
              {!isReadOnlySection && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="font-display"
                    onClick={() => duplicateCave(map.id, cave)}
                  >
                    <CopyPlus className="w-3 h-3" /> Duplicate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="font-display"
                    onClick={() => beginEditCave(cave)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="font-display border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => deleteCave(map.id, map.name, cave.id, cave.name)}
                  >
                    <Trash2 className="w-3 h-3" /> Delete cave
                  </Button>
                </>
              )}
            </div>
            {chunkHint && (
              <p className="text-[10px] text-muted-foreground text-right font-mono">{chunkHint}</p>
            )}
          </div>
        </div>
        {editingCaveId === cave.id ? (
          <textarea
            value={editFullCommands}
            onChange={(e) => setEditFullCommands(e.target.value)}
            className="ark-input min-h-[84px] w-full rounded p-2 text-[10px] font-mono"
            placeholder="Spawn/admin lines (one per line)"
          />
        ) : terminalPreview ? (
          <pre className="font-mono text-[9px] leading-relaxed text-muted-foreground bg-background/50 border border-border/40 rounded p-2 max-h-48 overflow-auto whitespace-pre-wrap break-all">
            {terminalPreview}
          </pre>
        ) : (
          <p className="text-[10px] text-muted-foreground italic">No terminal lines after teleport in ingest data.</p>
        )}
      </li>
    );
  };
  return (
    <div className="ark-app-shell space-y-6">
      <div className="card-ark space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="ark-kicker mb-1">Imported cave packs</p>
            <h2 className="flex items-center gap-2 font-display text-lg tracking-[0.12em] text-primary">
              <MapPinned className="h-5 w-5 drop-shadow-[0_0_10px_hsl(145_72%_46%/0.4)]" /> Custom Caves
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {totalMapCount} maps · {totalCaveCount} caves{" "}
              <span className="text-[10px] text-muted-foreground">
                (Custom: {maps.length}/{caveCount}, Terror: {terrorMaps.length}/{terrorCaveCount})
              </span>{" "}
              · Source:{" "}
              <span className="font-mono text-[10px] break-all">{sourceDir}</span>. Re-run{" "}
              <code className="text-[10px] bg-muted px-1 rounded">npm run ingest:caves:all</code> after changing cave files.{" "}
              <span className="text-foreground/80">GEN2 folders keep loadout mannequins (not Tribute Terminal).</span>
            </p>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Search className="w-3 h-3" /> Filter maps / caves
          </Label>
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="e.g. Batman, Valguero, spawnactor, TributeTerminal…"
            className="ark-input mt-1 max-w-md"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {lastDeletedCave && (
            <Button type="button" variant="outline" size="sm" className="font-display text-[10px]" onClick={undoDeleteCave}>
              <RotateCcw className="w-3 h-3" /> Undo delete
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" className="font-display text-[10px]" onClick={exportCavesBackup}>
            <Download className="w-3 h-3" /> Export backup
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-display text-[10px]"
            onClick={() => importFileRef.current?.click()}
          >
            <Upload className="w-3 h-3" /> Import backup
          </Button>
          <Button type="button" variant="outline" size="sm" className="font-display text-[10px]" onClick={clearAllDoorwayEdits}>
            <RotateCcw className="w-3 h-3" /> Clear doorway edits
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-display text-[10px] border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={resetAllToIngested}
          >
            <RotateCcw className="w-3 h-3" /> Reset to defaults
          </Button>
          <Button type="button" variant="outline" size="sm" className="font-display text-[10px]" onClick={restoreAutosaveMaps}>
            <RotateCcw className="w-3 h-3" /> Restore autosave
          </Button>
          {autosaveAt && (
            <span className="text-[10px] text-muted-foreground self-center">
              autosave: {new Date(autosaveAt).toLocaleString()}
            </span>
          )}
          <input
            ref={importFileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importCavesBackup(file);
              e.currentTarget.value = "";
            }}
          />
        </div>
        <div className="rounded-md border border-border/60 bg-background/40 p-3 space-y-2">
          <p className="text-[11px] text-muted-foreground">Add custom cave (saved locally in this browser profile)</p>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                selectedEditTarget
                  ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                  : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              Mode: {selectedEditTarget ? `Editing ${newCaveName || "selected cave"}` : "Add new cave"}
            </span>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[10px] text-muted-foreground">
              Map: {newMapName.trim() || newMapId.trim() || "none selected"}
            </span>
            {selectedEditTarget && (
              <>
                <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[10px]" onClick={previewSelectedCave}>
                  Preview selected cave
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[10px]" onClick={duplicateSelectedIntoAddMode}>
                  Duplicate into add mode
                </Button>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Suggested map (all maps) · {mapSuggestions.length}
              </Label>
              <Input
                value={mapSuggestionQuery}
                onChange={(e) => setMapSuggestionQuery(e.target.value)}
                placeholder="Filter maps..."
                className="ark-input mt-1 h-8 text-xs"
              />
              <Select
                value={selectedSuggestedMapId}
                onValueChange={(v) => {
                  setSelectedSuggestedMapId(v);
                  setSelectedSuggestedCaveKey(SUGGEST_NONE);
                  if (v !== SUGGEST_NONE) applySuggestedMap(v);
                }}
              >
                <SelectTrigger className="ark-input h-10 mt-1">
                  <SelectValue placeholder="Pick map suggestion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SUGGEST_NONE}>None</SelectItem>
                  {filteredMapSuggestions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Suggested cave (selected map) · {caveSuggestions.length}
              </Label>
              <Input
                value={caveSuggestionQuery}
                onChange={(e) => setCaveSuggestionQuery(e.target.value)}
                placeholder="Filter caves..."
                className="ark-input mt-1 h-8 text-xs"
                disabled={!selectedMapObject}
              />
              <Select
                value={selectedSuggestedCaveKey}
                onValueChange={(v) => {
                  setSelectedSuggestedCaveKey(v);
                  if (v !== SUGGEST_NONE) applySuggestedCave(v);
                  else setFormMode("add");
                }}
                disabled={!selectedMapObject}
              >
                <SelectTrigger className="ark-input h-10 mt-1">
                  <SelectValue placeholder="Pick cave suggestion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SUGGEST_NONE}>None</SelectItem>
                  {caveSuggestions.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {item.mapName} → {item.cave.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedMapObject ? (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Select a map first to list its caves.
                </p>
              ) : caveSuggestions.length === 0 ? (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  No caves found for this map yet.
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              value={newMapId}
              onChange={(e) => {
                setNewMapId(e.target.value);
                setSelectedSuggestedMapId(SUGGEST_NONE);
                setSelectedSuggestedCaveKey(SUGGEST_NONE);
                setFormMode("add");
              }}
              placeholder="Map ID (e.g. center-2-0)"
              list="custom-caves-map-id-suggestions"
              className="ark-input"
            />
            <datalist id="custom-caves-map-id-suggestions">
              {mapIdSuggestions.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>
            <Input
              value={newMapName}
              onChange={(e) => setNewMapName(e.target.value)}
              placeholder="Map Name (optional, used if creating new map)"
              className="ark-input"
            />
            <Input
              value={newCaveName}
              onChange={(e) => setNewCaveName(e.target.value)}
              placeholder="Cave name"
              className="ark-input"
            />
            <Select value={newPlacementType} onValueChange={(v) => setNewPlacementType(v as PlacementType)}>
              <SelectTrigger className="ark-input h-10">
                <SelectValue placeholder="Placement style" />
              </SelectTrigger>
              <SelectContent>
                {PLACEMENT_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={newTeleportLine}
              onChange={(e) => setNewTeleportLine(e.target.value)}
              placeholder="Teleport line (cheat spi ... or admincheat setplayerpos ...)"
              className="ark-input"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
            <div>
              <Label className="text-[10px] text-muted-foreground">Teleport command type</Label>
              <Select value={teleportCmdType} onValueChange={(v) => setTeleportCmdType(v as typeof teleportCmdType)}>
                <SelectTrigger className="h-9 text-xs ark-input mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheat spi">cheat spi</SelectItem>
                  <SelectItem value="admincheat setplayerpos">admincheat setplayerpos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input value={teleportX} onChange={(e) => setTeleportX(e.target.value)} placeholder="X" className="ark-input" />
            <Input value={teleportY} onChange={(e) => setTeleportY(e.target.value)} placeholder="Y" className="ark-input" />
            <Input value={teleportZ} onChange={(e) => setTeleportZ(e.target.value)} placeholder="Z" className="ark-input" />
            <Button type="button" variant="outline" size="sm" onClick={applyTeleportCoords} className="font-display h-9">
              Build teleport
            </Button>
          </div>
          <textarea
            value={newFullCommands}
            onChange={(e) => setNewFullCommands(e.target.value)}
            placeholder="Optional spawn/admin lines (one per line)"
            className="ark-input min-h-[88px] w-full rounded-md bg-background px-3 py-2 text-xs leading-relaxed"
          />
          {newPlacementType === "wall-terminals" && (
            <div className="rounded-md border border-border/60 bg-background/50 p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Wall preset generator (matches the style you pasted: X columns by Z rows).
              </p>
              <Input
                value={wallBlueprintPath}
                onChange={(e) => setWallBlueprintPath(e.target.value)}
                placeholder="Blueprint path without wrapping Blueprint'...'"
                className="ark-input"
              />
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <Input value={wallXCount} onChange={(e) => setWallXCount(e.target.value)} placeholder="Columns" className="ark-input" />
                <Input value={wallZCount} onChange={(e) => setWallZCount(e.target.value)} placeholder="Rows" className="ark-input" />
                <Input value={wallXStep} onChange={(e) => setWallXStep(e.target.value)} placeholder="X step" className="ark-input" />
                <Input value={wallZStep} onChange={(e) => setWallZStep(e.target.value)} placeholder="Z step" className="ark-input" />
                <Input value={wallYOffset} onChange={(e) => setWallYOffset(e.target.value)} placeholder="Y offset" className="ark-input" />
                <Button type="button" variant="outline" size="sm" onClick={applyWallPreset} className="font-display h-9">
                  Build wall commands
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            {selectedEditTarget && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-display"
                onClick={() => {
                  setSelectedSuggestedCaveKey(SUGGEST_NONE);
                  setFormMode("add");
                }}
              >
                Switch to add mode
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={resetAddCaveForm} className="font-display">
              Reset form
            </Button>
            <Button type="button" variant="neon" size="sm" onClick={addCave} className="font-display">
              <Plus className="w-3 h-3" /> {selectedEditTarget ? "Save cave changes" : "Add cave"}
            </Button>
          </div>
        </div>
      </div>

      <div className="card-ark p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="ark-section-title text-sm flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-primary" /> Official cave maps (internet source)
          </h3>
          <span className="text-[10px] text-muted-foreground">
            Source: ark.wiki.gg explorer maps
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,20rem)_auto] gap-2 items-end">
          <div>
            <Label className="text-[10px] text-muted-foreground">Official map</Label>
            <Select value={officialMapRefId} onValueChange={setOfficialMapRefId}>
              <SelectTrigger className="ark-input h-10 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OFFICIAL_MAP_REFERENCES.map((map) => (
                  <SelectItem key={map.id} value={map.id}>
                    {map.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => window.open(selectedOfficialMapRef.explorerUrl, "_blank", "noopener,noreferrer")}>
              Open explorer map
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => window.open(selectedOfficialMapRef.cavesUrl, "_blank", "noopener,noreferrer")}>
              Open cave names list
            </Button>
          </div>
        </div>
        <div className="rounded-md border border-border/60 bg-background/60 overflow-hidden">
          <iframe
            title={`Official Explorer Map ${selectedOfficialMapRef.name}`}
            src={selectedOfficialMapRef.explorerUrl}
            className="w-full h-[min(70vh,680px)] bg-background"
            loading="lazy"
          />
        </div>
      </div>

      {catalogLoading && maps.length === 0 && (
        <div className="card-ark p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3 h-3 animate-spin" /> Loading cave catalog…
          </div>
          <div className="space-y-2">
            <div className="h-8 rounded bg-secondary/40 animate-pulse" />
            <div className="h-8 rounded bg-secondary/30 animate-pulse" />
            <div className="h-8 rounded bg-secondary/20 animate-pulse" />
          </div>
        </div>
      )}

      {!catalogLoading && catalogLoadError && (
        <div className="card-ark p-4 space-y-2 border border-amber-500/30 bg-amber-500/5">
          <p className="text-xs text-amber-200/90 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" /> {catalogLoadError}
          </p>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" className="font-display text-[10px]" onClick={() => void loadCatalog()}>
              <RefreshCw className="w-3 h-3" /> Retry load
            </Button>
          </div>
        </div>
      )}

      <div className="card-ark space-y-3 p-5">
        <h3 className="ark-section-title text-sm flex items-center gap-2">
          <Box className="h-4 w-4 text-primary" /> 3D preview
          {previewLabel ? (
            <span className="text-[10px] font-normal text-foreground/80 truncate max-w-[min(100%,28rem)]">
              · {previewLabel}
            </span>
          ) : null}
        </h3>
        {previewCommands.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Click <strong className="text-foreground">3D preview</strong> on a cave row (same HDR view as Structures / Grid). Caves need at least one line with X Y Z coordinates
            (teleport or spawn).
          </p>
        ) : (
          <Suspense
            fallback={
              <div className="flex h-48 w-full items-center justify-center rounded-xl border border-border/40 bg-secondary/25 bg-[radial-gradient(ellipse_at_center,hsl(145_72%_46%/0.06),transparent_70%)]">
                <span className="font-display text-xs tracking-wide text-muted-foreground animate-pulse">Loading 3D engine…</span>
              </div>
            }
          >
            <div className="space-y-2">
              <Preview3D
                commands={previewCommands}
                commandIndices={previewIndexMap}
                maxPoints={72000}
                onPointClick={handlePreviewPointClick}
              />
              {previewCaveId && (
                <div className="flex items-center justify-between gap-2 px-1">
                  <p className="text-[10px] text-muted-foreground">
                    Click voxels to toggle individual terminals for this cave (doorways, tunnels, gaps). Hidden:{" "}
                    <span className="font-mono">
                      {hiddenByCave[previewCaveId]?.size ? hiddenByCave[previewCaveId]!.size : 0}
                    </span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px] font-display"
                    onClick={resetHiddenForCurrentPreview}
                  >
                    Reset doorways
                  </Button>
                </div>
              )}
            </div>
          </Suspense>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground mb-2 px-1">
          Editable mode enabled: use <span className="font-mono">3D preview</span> to click terminals in/out, then{" "}
          <span className="font-mono">Copy next chunk</span> or <span className="font-mono">Copy all commands</span>.
        </p>
        <div className="card-ark p-3">
          <ScrollArea className="h-[min(70vh,calc(100vh-14rem))] pr-3">
            <Accordion type="multiple" className="w-full px-2">
              {visibleFinishedMaps.map((map) => (
                <AccordionItem key={map.id} value={map.id} className="border-border/60">
                  <AccordionTrigger className="font-display text-sm text-foreground hover:text-primary py-3">
                    <span>
                      {map.name}{" "}
                      <span className="text-muted-foreground font-normal text-xs">({map.caves.length})</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-border/50 bg-background/40 p-2">
                      {editingMapId === map.id ? (
                        <>
                          <Input
                            value={editMapName}
                            onChange={(e) => setEditMapName(e.target.value)}
                            placeholder="Map name"
                            className="ark-input h-8 max-w-sm text-xs"
                          />
                          <Button type="button" variant="neon" size="sm" className="font-display" onClick={() => saveEditMap(map.id)}>
                            Save map
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="font-display" onClick={cancelEditMap}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button type="button" variant="outline" size="sm" className="font-display text-[10px]" onClick={() => beginEditMap(map)}>
                          Edit map name
                        </Button>
                      )}
                    </div>
                    <ul className="space-y-3 pb-4">
                      {map.caves.map((cave) => renderCaveRow(map, cave))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFinished.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">No caves match your filter.</p>
            )}
            {filteredFinished.length > finishedVisibleMaps && (
              <div className="flex justify-center py-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setFinishedVisibleMaps((v) => v + 24)}>
                  Load more maps
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground mb-2 px-1">
          Terror Customs: most maps convert Genesis 2 mannequins to Tribute Terminal on ingest; the{" "}
          <span className="text-foreground/90">Gen2</span> folder keeps loadout mannequin blueprints.
        </p>
        <div className="card-ark p-3 border-primary/25">
          <ScrollArea className="h-[min(70vh,calc(100vh-14rem))] pr-3">
            <Accordion type="multiple" className="w-full px-2">
              {visibleTerrorMaps.map((map) => (
                <AccordionItem key={`terror-${map.id}`} value={`terror-${map.id}`} className="border-border/60">
                  <AccordionTrigger className="font-display text-sm text-foreground hover:text-primary py-3">
                    <span>
                      {map.name}{" "}
                      <span className="text-muted-foreground font-normal text-xs">({map.caves.length})</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 pb-4">
                      {map.caves.map((cave) => renderCaveRow(map, cave, "terror-"))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredTerror.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">No terror caves match your filter.</p>
            )}
            {filteredTerror.length > terrorVisibleMaps && (
              <div className="flex justify-center py-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setTerrorVisibleMaps((v) => v + 24)}>
                  Load more terror maps
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
