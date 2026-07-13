/**
 * Full workspace snapshot for share links, JSON export/import, and named presets (v2).
 * Legacy v1 payloads omit `v` and many keys — apply still merges recognized fields.
 */

import { SHAPE_PRESETS, type ShapeCategory, type ShapeConfig } from "@/lib/shapeGenerators";
import type { GridStyle, GridTemplateCategory } from "@/lib/gridTemplates";
import type { CommandOutputStyle, Mode, SpawnAnchorChoice } from "@/pages/index/arenaIndexConstants";

export const ARENA_WORKSPACE_PAYLOAD_VERSION = 2;

const GRID_STYLES: GridStyle[] = ["flat", "simpleWalls", "walls", "wallStack"];
const SPAWN_ANCHORS: SpawnAnchorChoice[] = [
  "manual",
  "teleportCorner",
  "teleportCenter",
  "teleportFace",
  "localLayout",
  "playerRelative",
];
const TEMPLATE_CATS: GridTemplateCategory[] = ["flat", "simple", "layout", "stacked", "tiers"];
const DIFFICULTY = ["small", "medium", "large", "brutal"] as const;
const PATH_STYLE = ["linear", "zigzag", "circular", "serpentine"] as const;
const TRAVERSAL = ["spiral", "outer", "ramp", "jumpgap"] as const;
const ROOF = ["open", "closed"] as const;
const CAGE = ["small", "medium", "giant"] as const;
const CREATURE = ["low", "medium", "ultra"] as const;
const PASTE_ORDER = ["lowFirst", "highFirst"] as const;
const FACE_ORIGIN = ["corner", "center"] as const;

function isNum(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}
function isBool(x: unknown): x is boolean {
  return typeof x === "boolean";
}
function isStr(x: unknown): x is string {
  return typeof x === "string";
}

export type ArenaWorkspaceSnapshotInput = {
  mode: Mode;
  maxX: number;
  maxY: number;
  xStep: number;
  yStep: number;
  gridZ: number;
  gridStyle: GridStyle;
  simpleWallWidth: number;
  simpleWallDepth: number;
  simpleWallStep: number;
  simpleWallThicknessLayers: number;
  simpleWallThicknessSpacing: number;
  gridWallZOffset: number;
  gridWallHeight: number;
  gridWallVerticalStep: number;
  gridWallThicknessLayers: number;
  gridWallThicknessSpacing: number;
  gridWallIncludeFloor: boolean;
  gridWallVerticalFull: boolean;
  buildOriginX: number;
  buildOriginY: number;
  buildOriginZ: number;
  spawnAnchor: SpawnAnchorChoice;
  faceYawDeg: number;
  faceForward: number;
  faceRight: number;
  faceUp: number;
  faceOriginMode: "corner" | "center";
  gridYawDeg: number;
  gridPasteXOrder: "lowFirst" | "highFirst";
  gridTemplateCategory: GridTemplateCategory;
  activeShape: ShapeConfig;
  shapeCenterX: number;
  shapeCenterY: number;
  shapeCenterZ: number;
  shapeRadius: number;
  shapeStep: number;
  mazeSeed: number;
  wallHeight: number;
  wallThickness: number;
  difficulty: "small" | "medium" | "large" | "brutal";
  hasFloor: boolean;
  hasBorder: boolean;
  hasCornerTowers: boolean;
  deadEndDensity: number;
  pathStyle: "linear" | "zigzag" | "circular" | "serpentine";
  obstacleDensity: number;
  hasSpectatorPlatforms: boolean;
  hasRailings: boolean;
  traversalStyle: "spiral" | "outer" | "ramp" | "jumpgap";
  floorCount: number;
  hasCentralPillar: boolean;
  hasTopPlatform: boolean;
  hasInnerFloor: boolean;
  hasBridges: boolean;
  hasSupportPillars: boolean;
  roofStyle: "open" | "closed";
  hasDoors: boolean;
  hasCornerPosts: boolean;
  hasCenterMarker: boolean;
  cagePreset: "small" | "medium" | "giant";
  gateCount: number;
  hasVIPPlatform: boolean;
  creatureDetailLevel: "low" | "medium" | "ultra";
  blueprint: string;
  commandOutputStyle: CommandOutputStyle;
  chunkSize: number;
  copyMode: "multiline" | "singleline";
  includeTeleport: boolean;
  teleportX: number;
  teleportY: number;
  teleportZ: number;
  customFileName: string;
};

export function buildArenaWorkspacePayload(s: ArenaWorkspaceSnapshotInput): Record<string, unknown> {
  return {
    v: ARENA_WORKSPACE_PAYLOAD_VERSION,
    mode: s.mode,
    maxX: s.maxX,
    maxY: s.maxY,
    xStep: s.xStep,
    yStep: s.yStep,
    gridZ: s.gridZ,
    gridStyle: s.gridStyle,
    simpleWallWidth: s.simpleWallWidth,
    simpleWallDepth: s.simpleWallDepth,
    simpleWallStep: s.simpleWallStep,
    simpleWallThicknessLayers: s.simpleWallThicknessLayers,
    simpleWallThicknessSpacing: s.simpleWallThicknessSpacing,
    gridWallZOffset: s.gridWallZOffset,
    gridWallHeight: s.gridWallHeight,
    gridWallVerticalStep: s.gridWallVerticalStep,
    gridWallThicknessLayers: s.gridWallThicknessLayers,
    gridWallThicknessSpacing: s.gridWallThicknessSpacing,
    gridWallIncludeFloor: s.gridWallIncludeFloor,
    gridWallVerticalFull: s.gridWallVerticalFull,
    buildOriginX: s.buildOriginX,
    buildOriginY: s.buildOriginY,
    buildOriginZ: s.buildOriginZ,
    spawnAnchor: s.spawnAnchor,
    faceYawDeg: s.faceYawDeg,
    faceForward: s.faceForward,
    faceRight: s.faceRight,
    faceUp: s.faceUp,
    faceOriginMode: s.faceOriginMode,
    gridYawDeg: s.gridYawDeg,
    gridPasteXOrder: s.gridPasteXOrder,
    gridTemplateCategory: s.gridTemplateCategory,
    activeShapeName: s.activeShape.name,
    shapeCenterX: s.shapeCenterX,
    shapeCenterY: s.shapeCenterY,
    shapeCenterZ: s.shapeCenterZ,
    shapeRadius: s.shapeRadius,
    shapeStep: s.shapeStep,
    mazeSeed: s.mazeSeed,
    wallHeight: s.wallHeight,
    wallThickness: s.wallThickness,
    difficulty: s.difficulty,
    hasFloor: s.hasFloor,
    hasBorder: s.hasBorder,
    hasCornerTowers: s.hasCornerTowers,
    deadEndDensity: s.deadEndDensity,
    pathStyle: s.pathStyle,
    obstacleDensity: s.obstacleDensity,
    hasSpectatorPlatforms: s.hasSpectatorPlatforms,
    hasRailings: s.hasRailings,
    traversalStyle: s.traversalStyle,
    floorCount: s.floorCount,
    hasCentralPillar: s.hasCentralPillar,
    hasTopPlatform: s.hasTopPlatform,
    hasInnerFloor: s.hasInnerFloor,
    hasBridges: s.hasBridges,
    hasSupportPillars: s.hasSupportPillars,
    roofStyle: s.roofStyle,
    hasDoors: s.hasDoors,
    hasCornerPosts: s.hasCornerPosts,
    hasCenterMarker: s.hasCenterMarker,
    cagePreset: s.cagePreset,
    gateCount: s.gateCount,
    hasVIPPlatform: s.hasVIPPlatform,
    creatureDetailLevel: s.creatureDetailLevel,
    blueprint: s.blueprint,
    commandOutputStyle: s.commandOutputStyle,
    chunkSize: s.chunkSize,
    copyMode: s.copyMode,
    includeTeleport: s.includeTeleport,
    teleportX: s.teleportX,
    teleportY: s.teleportY,
    teleportZ: s.teleportZ,
    customFileName: s.customFileName,
  };
}

export type ArenaWorkspaceApplyFns = {
  setMode: (m: Mode) => void;
  setMaxX: (n: number) => void;
  setMaxY: (n: number) => void;
  setXStep: (n: number) => void;
  setYStep: (n: number) => void;
  setGridZ: (n: number) => void;
  setGridStyle: (g: GridStyle) => void;
  setSimpleWallWidth: (n: number) => void;
  setSimpleWallDepth: (n: number) => void;
  setSimpleWallStep: (n: number) => void;
  setSimpleWallThicknessLayers: (n: number) => void;
  setSimpleWallThicknessSpacing: (n: number) => void;
  setGridWallZOffset: (n: number) => void;
  setGridWallHeight: (n: number) => void;
  setGridWallVerticalStep: (n: number) => void;
  setGridWallThicknessLayers: (n: number) => void;
  setGridWallThicknessSpacing: (n: number) => void;
  setGridWallIncludeFloor: (b: boolean) => void;
  setGridWallVerticalFull: (b: boolean) => void;
  setBuildOriginX: (n: number) => void;
  setBuildOriginY: (n: number) => void;
  setBuildOriginZ: (n: number) => void;
  setSpawnAnchor: (a: SpawnAnchorChoice) => void;
  setFaceYawDeg: (n: number) => void;
  setFaceForward: (n: number) => void;
  setFaceRight: (n: number) => void;
  setFaceUp: (n: number) => void;
  setFaceOriginMode: (m: "corner" | "center") => void;
  setGridYawDeg: (n: number) => void;
  setGridPasteXOrder: (o: "lowFirst" | "highFirst") => void;
  setGridTemplateCategory: (c: GridTemplateCategory) => void;
  setActiveShape: (s: ShapeConfig) => void;
  setShapeCategory: (c: ShapeCategory) => void;
  setShapeCenterX: (n: number) => void;
  setShapeCenterY: (n: number) => void;
  setShapeCenterZ: (n: number) => void;
  setShapeRadius: (n: number) => void;
  setShapeStep: (n: number) => void;
  setMazeSeed: (n: number) => void;
  setWallHeight: (n: number) => void;
  setWallThickness: (n: number) => void;
  setDifficulty: (d: "small" | "medium" | "large" | "brutal") => void;
  setHasFloor: (b: boolean) => void;
  setHasBorder: (b: boolean) => void;
  setHasCornerTowers: (b: boolean) => void;
  setDeadEndDensity: (n: number) => void;
  setPathStyle: (p: "linear" | "zigzag" | "circular" | "serpentine") => void;
  setObstacleDensity: (n: number) => void;
  setHasSpectatorPlatforms: (b: boolean) => void;
  setHasRailings: (b: boolean) => void;
  setTraversalStyle: (t: "spiral" | "outer" | "ramp" | "jumpgap") => void;
  setFloorCount: (n: number) => void;
  setHasCentralPillar: (b: boolean) => void;
  setHasTopPlatform: (b: boolean) => void;
  setHasInnerFloor: (b: boolean) => void;
  setHasBridges: (b: boolean) => void;
  setHasSupportPillars: (b: boolean) => void;
  setRoofStyle: (r: "open" | "closed") => void;
  setHasDoors: (b: boolean) => void;
  setHasCornerPosts: (b: boolean) => void;
  setHasCenterMarker: (b: boolean) => void;
  setCagePreset: (c: "small" | "medium" | "giant") => void;
  setGateCount: (n: number) => void;
  setHasVIPPlatform: (b: boolean) => void;
  setCreatureDetailLevel: (l: "low" | "medium" | "ultra") => void;
  setBlueprint: (s: string) => void;
  setCommandOutputStyle: (s: CommandOutputStyle) => void;
  setChunkSize: (n: number) => void;
  setCopyMode: (m: "multiline" | "singleline") => void;
  setIncludeTeleport: (b: boolean) => void;
  setTeleportX: (n: number) => void;
  setTeleportY: (n: number) => void;
  setTeleportZ: (n: number) => void;
  setCustomFileName: (s: string) => void;
};

/**
 * Merges snapshot into UI state. Call `suppressShapeDefaultSyncRef` (see Index) before this when
 * `activeShapeName` is present so preset/share options are not overwritten by the activeShape effect.
 */
export function applyArenaWorkspacePayload(cfg: Record<string, unknown>, h: ArenaWorkspaceApplyFns): number {
  let n = 0;

  if (typeof cfg.activeShapeName === "string") {
    const found = SHAPE_PRESETS.find((s) => s.name === cfg.activeShapeName);
    if (found) {
      h.setActiveShape(found);
      h.setShapeCategory(found.category);
      n += 1;
    }
  }

  const m = cfg.mode;
  if (m === "grid" || m === "shape" || m === "caves") {
    h.setMode(m);
    n += 1;
  }

  if (isNum(cfg.maxX)) {
    h.setMaxX(cfg.maxX);
    n += 1;
  }
  if (isNum(cfg.maxY)) {
    h.setMaxY(cfg.maxY);
    n += 1;
  }
  if (isNum(cfg.xStep)) {
    h.setXStep(cfg.xStep);
    n += 1;
  }
  if (isNum(cfg.yStep)) {
    h.setYStep(cfg.yStep);
    n += 1;
  }
  if (isNum(cfg.gridZ)) {
    h.setGridZ(cfg.gridZ);
    n += 1;
  }
  if (isStr(cfg.gridStyle) && GRID_STYLES.includes(cfg.gridStyle as GridStyle)) {
    h.setGridStyle(cfg.gridStyle as GridStyle);
    n += 1;
  }

  if (isNum(cfg.simpleWallWidth)) {
    h.setSimpleWallWidth(cfg.simpleWallWidth);
    n += 1;
  }
  if (isNum(cfg.simpleWallDepth)) {
    h.setSimpleWallDepth(cfg.simpleWallDepth);
    n += 1;
  }
  if (isNum(cfg.simpleWallStep)) {
    h.setSimpleWallStep(cfg.simpleWallStep);
    n += 1;
  }
  if (isNum(cfg.simpleWallThicknessLayers)) {
    h.setSimpleWallThicknessLayers(Math.round(cfg.simpleWallThicknessLayers));
    n += 1;
  }
  if (isNum(cfg.simpleWallThicknessSpacing)) {
    h.setSimpleWallThicknessSpacing(cfg.simpleWallThicknessSpacing);
    n += 1;
  }

  if (isNum(cfg.gridWallZOffset)) {
    h.setGridWallZOffset(cfg.gridWallZOffset);
    n += 1;
  }
  if (isNum(cfg.gridWallHeight)) {
    h.setGridWallHeight(cfg.gridWallHeight);
    n += 1;
  }
  if (isNum(cfg.gridWallVerticalStep)) {
    h.setGridWallVerticalStep(cfg.gridWallVerticalStep);
    n += 1;
  }
  if (isNum(cfg.gridWallThicknessLayers)) {
    h.setGridWallThicknessLayers(Math.round(cfg.gridWallThicknessLayers));
    n += 1;
  }
  if (isNum(cfg.gridWallThicknessSpacing)) {
    h.setGridWallThicknessSpacing(cfg.gridWallThicknessSpacing);
    n += 1;
  }
  if (isBool(cfg.gridWallIncludeFloor)) {
    h.setGridWallIncludeFloor(cfg.gridWallIncludeFloor);
    n += 1;
  }
  if (isBool(cfg.gridWallVerticalFull)) {
    h.setGridWallVerticalFull(cfg.gridWallVerticalFull);
    n += 1;
  }

  if (isNum(cfg.buildOriginX)) {
    h.setBuildOriginX(cfg.buildOriginX);
    n += 1;
  }
  if (isNum(cfg.buildOriginY)) {
    h.setBuildOriginY(cfg.buildOriginY);
    n += 1;
  }
  if (isNum(cfg.buildOriginZ)) {
    h.setBuildOriginZ(cfg.buildOriginZ);
    n += 1;
  }

  if (isStr(cfg.spawnAnchor) && SPAWN_ANCHORS.includes(cfg.spawnAnchor as SpawnAnchorChoice)) {
    h.setSpawnAnchor(cfg.spawnAnchor as SpawnAnchorChoice);
    n += 1;
  }

  if (isNum(cfg.faceYawDeg)) {
    h.setFaceYawDeg(cfg.faceYawDeg);
    n += 1;
  }
  if (isNum(cfg.faceForward)) {
    h.setFaceForward(cfg.faceForward);
    n += 1;
  }
  if (isNum(cfg.faceRight)) {
    h.setFaceRight(cfg.faceRight);
    n += 1;
  }
  if (isNum(cfg.faceUp)) {
    h.setFaceUp(cfg.faceUp);
    n += 1;
  }
  if (isStr(cfg.faceOriginMode) && FACE_ORIGIN.includes(cfg.faceOriginMode as "corner" | "center")) {
    h.setFaceOriginMode(cfg.faceOriginMode as "corner" | "center");
    n += 1;
  }
  if (isNum(cfg.gridYawDeg)) {
    h.setGridYawDeg(cfg.gridYawDeg);
    n += 1;
  }
  if (isStr(cfg.gridPasteXOrder) && PASTE_ORDER.includes(cfg.gridPasteXOrder as "lowFirst" | "highFirst")) {
    h.setGridPasteXOrder(cfg.gridPasteXOrder as "lowFirst" | "highFirst");
    n += 1;
  }
  if (isStr(cfg.gridTemplateCategory) && TEMPLATE_CATS.includes(cfg.gridTemplateCategory as GridTemplateCategory)) {
    h.setGridTemplateCategory(cfg.gridTemplateCategory as GridTemplateCategory);
    n += 1;
  }

  if (isNum(cfg.shapeCenterX)) {
    h.setShapeCenterX(cfg.shapeCenterX);
    n += 1;
  }
  if (isNum(cfg.shapeCenterY)) {
    h.setShapeCenterY(cfg.shapeCenterY);
    n += 1;
  }
  if (isNum(cfg.shapeCenterZ)) {
    h.setShapeCenterZ(cfg.shapeCenterZ);
    n += 1;
  }
  if (isNum(cfg.shapeRadius)) {
    h.setShapeRadius(cfg.shapeRadius);
    n += 1;
  }
  if (isNum(cfg.shapeStep)) {
    h.setShapeStep(cfg.shapeStep);
    n += 1;
  }
  if (isNum(cfg.mazeSeed)) {
    h.setMazeSeed(Math.round(cfg.mazeSeed));
    n += 1;
  }

  if (isNum(cfg.wallHeight)) {
    h.setWallHeight(cfg.wallHeight);
    n += 1;
  }
  if (isNum(cfg.wallThickness)) {
    h.setWallThickness(cfg.wallThickness);
    n += 1;
  }
  if (isStr(cfg.difficulty) && DIFFICULTY.includes(cfg.difficulty as (typeof DIFFICULTY)[number])) {
    h.setDifficulty(cfg.difficulty as (typeof DIFFICULTY)[number]);
    n += 1;
  }
  if (isBool(cfg.hasFloor)) {
    h.setHasFloor(cfg.hasFloor);
    n += 1;
  }
  if (isBool(cfg.hasBorder)) {
    h.setHasBorder(cfg.hasBorder);
    n += 1;
  }
  if (isBool(cfg.hasCornerTowers)) {
    h.setHasCornerTowers(cfg.hasCornerTowers);
    n += 1;
  }
  if (isNum(cfg.deadEndDensity)) {
    h.setDeadEndDensity(cfg.deadEndDensity);
    n += 1;
  }
  if (isStr(cfg.pathStyle) && PATH_STYLE.includes(cfg.pathStyle as (typeof PATH_STYLE)[number])) {
    h.setPathStyle(cfg.pathStyle as (typeof PATH_STYLE)[number]);
    n += 1;
  }
  if (isNum(cfg.obstacleDensity)) {
    h.setObstacleDensity(cfg.obstacleDensity);
    n += 1;
  }
  if (isBool(cfg.hasSpectatorPlatforms)) {
    h.setHasSpectatorPlatforms(cfg.hasSpectatorPlatforms);
    n += 1;
  }
  if (isBool(cfg.hasRailings)) {
    h.setHasRailings(cfg.hasRailings);
    n += 1;
  }
  if (isStr(cfg.traversalStyle) && TRAVERSAL.includes(cfg.traversalStyle as (typeof TRAVERSAL)[number])) {
    h.setTraversalStyle(cfg.traversalStyle as (typeof TRAVERSAL)[number]);
    n += 1;
  }
  if (isNum(cfg.floorCount)) {
    h.setFloorCount(Math.round(cfg.floorCount));
    n += 1;
  }
  if (isBool(cfg.hasCentralPillar)) {
    h.setHasCentralPillar(cfg.hasCentralPillar);
    n += 1;
  }
  if (isBool(cfg.hasTopPlatform)) {
    h.setHasTopPlatform(cfg.hasTopPlatform);
    n += 1;
  }
  if (isBool(cfg.hasInnerFloor)) {
    h.setHasInnerFloor(cfg.hasInnerFloor);
    n += 1;
  }
  if (isBool(cfg.hasBridges)) {
    h.setHasBridges(cfg.hasBridges);
    n += 1;
  }
  if (isBool(cfg.hasSupportPillars)) {
    h.setHasSupportPillars(cfg.hasSupportPillars);
    n += 1;
  }
  if (isStr(cfg.roofStyle) && ROOF.includes(cfg.roofStyle as (typeof ROOF)[number])) {
    h.setRoofStyle(cfg.roofStyle as (typeof ROOF)[number]);
    n += 1;
  }
  if (isBool(cfg.hasDoors)) {
    h.setHasDoors(cfg.hasDoors);
    n += 1;
  }
  if (isBool(cfg.hasCornerPosts)) {
    h.setHasCornerPosts(cfg.hasCornerPosts);
    n += 1;
  }
  if (isBool(cfg.hasCenterMarker)) {
    h.setHasCenterMarker(cfg.hasCenterMarker);
    n += 1;
  }
  if (isStr(cfg.cagePreset) && CAGE.includes(cfg.cagePreset as (typeof CAGE)[number])) {
    h.setCagePreset(cfg.cagePreset as (typeof CAGE)[number]);
    n += 1;
  }
  if (isNum(cfg.gateCount)) {
    h.setGateCount(Math.round(cfg.gateCount));
    n += 1;
  }
  if (isBool(cfg.hasVIPPlatform)) {
    h.setHasVIPPlatform(cfg.hasVIPPlatform);
    n += 1;
  }
  if (isStr(cfg.creatureDetailLevel) && CREATURE.includes(cfg.creatureDetailLevel as (typeof CREATURE)[number])) {
    h.setCreatureDetailLevel(cfg.creatureDetailLevel as (typeof CREATURE)[number]);
    n += 1;
  }

  if (isStr(cfg.blueprint)) {
    h.setBlueprint(cfg.blueprint);
    n += 1;
  }
  if (cfg.commandOutputStyle === "spawnactor" || cfg.commandOutputStyle === "summon") {
    h.setCommandOutputStyle(cfg.commandOutputStyle);
    n += 1;
  }

  if (isNum(cfg.chunkSize) && cfg.chunkSize > 0) {
    h.setChunkSize(Math.round(cfg.chunkSize));
    n += 1;
  }
  if (cfg.copyMode === "multiline" || cfg.copyMode === "singleline") {
    h.setCopyMode(cfg.copyMode);
    n += 1;
  }
  if (isBool(cfg.includeTeleport)) {
    h.setIncludeTeleport(cfg.includeTeleport);
    n += 1;
  }
  if (isNum(cfg.teleportX)) {
    h.setTeleportX(cfg.teleportX);
    n += 1;
  }
  if (isNum(cfg.teleportY)) {
    h.setTeleportY(cfg.teleportY);
    n += 1;
  }
  if (isNum(cfg.teleportZ)) {
    h.setTeleportZ(cfg.teleportZ);
    n += 1;
  }
  if (isStr(cfg.customFileName)) {
    h.setCustomFileName(cfg.customFileName);
    n += 1;
  }

  return n;
}
