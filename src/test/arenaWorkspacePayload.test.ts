import { describe, expect, it, vi } from "vitest";
import {
  applyArenaWorkspacePayload,
  ARENA_WORKSPACE_PAYLOAD_VERSION,
  buildArenaWorkspacePayload,
} from "@/lib/arenaWorkspacePayload";
import { SHAPE_PRESETS } from "@/lib/shapeGenerators";

function mockHandlers() {
  return {
    setMode: vi.fn(),
    setMaxX: vi.fn(),
    setMaxY: vi.fn(),
    setXStep: vi.fn(),
    setYStep: vi.fn(),
    setGridZ: vi.fn(),
    setGridStyle: vi.fn(),
    setSimpleWallWidth: vi.fn(),
    setSimpleWallDepth: vi.fn(),
    setSimpleWallStep: vi.fn(),
    setSimpleWallThicknessLayers: vi.fn(),
    setSimpleWallThicknessSpacing: vi.fn(),
    setGridWallZOffset: vi.fn(),
    setGridWallHeight: vi.fn(),
    setGridWallVerticalStep: vi.fn(),
    setGridWallThicknessLayers: vi.fn(),
    setGridWallThicknessSpacing: vi.fn(),
    setGridWallIncludeFloor: vi.fn(),
    setGridWallVerticalFull: vi.fn(),
    setBuildOriginX: vi.fn(),
    setBuildOriginY: vi.fn(),
    setBuildOriginZ: vi.fn(),
    setSpawnAnchor: vi.fn(),
    setFaceYawDeg: vi.fn(),
    setFaceForward: vi.fn(),
    setFaceRight: vi.fn(),
    setFaceUp: vi.fn(),
    setFaceOriginMode: vi.fn(),
    setGridYawDeg: vi.fn(),
    setGridPasteXOrder: vi.fn(),
    setGridTemplateCategory: vi.fn(),
    setActiveShape: vi.fn(),
    setShapeCategory: vi.fn(),
    setShapeCenterX: vi.fn(),
    setShapeCenterY: vi.fn(),
    setShapeCenterZ: vi.fn(),
    setShapeRadius: vi.fn(),
    setShapeStep: vi.fn(),
    setMazeSeed: vi.fn(),
    setWallHeight: vi.fn(),
    setWallThickness: vi.fn(),
    setDifficulty: vi.fn(),
    setHasFloor: vi.fn(),
    setHasBorder: vi.fn(),
    setHasCornerTowers: vi.fn(),
    setDeadEndDensity: vi.fn(),
    setPathStyle: vi.fn(),
    setObstacleDensity: vi.fn(),
    setHasSpectatorPlatforms: vi.fn(),
    setHasRailings: vi.fn(),
    setTraversalStyle: vi.fn(),
    setFloorCount: vi.fn(),
    setHasCentralPillar: vi.fn(),
    setHasTopPlatform: vi.fn(),
    setHasInnerFloor: vi.fn(),
    setHasBridges: vi.fn(),
    setHasSupportPillars: vi.fn(),
    setRoofStyle: vi.fn(),
    setHasDoors: vi.fn(),
    setHasCornerPosts: vi.fn(),
    setHasCenterMarker: vi.fn(),
    setCagePreset: vi.fn(),
    setGateCount: vi.fn(),
    setHasVIPPlatform: vi.fn(),
    setCreatureDetailLevel: vi.fn(),
    setBlueprint: vi.fn(),
    setCommandOutputStyle: vi.fn(),
    setChunkSize: vi.fn(),
    setCopyMode: vi.fn(),
    setIncludeTeleport: vi.fn(),
    setTeleportX: vi.fn(),
    setTeleportY: vi.fn(),
    setTeleportZ: vi.fn(),
    setCustomFileName: vi.fn(),
  };
}

describe("arenaWorkspacePayload", () => {
  it("build includes version", () => {
    const s = SHAPE_PRESETS[0];
    const p = buildArenaWorkspacePayload({
      mode: "shape",
      maxX: 1,
      maxY: 2,
      xStep: 3,
      yStep: 4,
      gridZ: 0,
      gridStyle: "flat",
      simpleWallWidth: 1,
      simpleWallDepth: 1,
      simpleWallStep: 1,
      simpleWallThicknessLayers: 1,
      simpleWallThicknessSpacing: 1,
      gridWallZOffset: 0,
      gridWallHeight: 1,
      gridWallVerticalStep: 1,
      gridWallThicknessLayers: 1,
      gridWallThicknessSpacing: 1,
      gridWallIncludeFloor: true,
      gridWallVerticalFull: false,
      buildOriginX: 0,
      buildOriginY: 0,
      buildOriginZ: 0,
      spawnAnchor: "playerRelative",
      faceYawDeg: 0,
      faceForward: 8000,
      faceRight: 0,
      faceUp: 0,
      faceOriginMode: "center",
      gridYawDeg: 0,
      gridPasteXOrder: "highFirst",
      gridTemplateCategory: "flat",
      activeShape: s,
      shapeCenterX: 0,
      shapeCenterY: 0,
      shapeCenterZ: 0,
      shapeRadius: s.radius,
      shapeStep: s.step,
      mazeSeed: 1,
      wallHeight: 1,
      wallThickness: 1,
      difficulty: "medium",
      hasFloor: true,
      hasBorder: true,
      hasCornerTowers: false,
      deadEndDensity: 0,
      pathStyle: "zigzag",
      obstacleDensity: 0.5,
      hasSpectatorPlatforms: false,
      hasRailings: true,
      traversalStyle: "spiral",
      floorCount: 1,
      hasCentralPillar: true,
      hasTopPlatform: true,
      hasInnerFloor: false,
      hasBridges: false,
      hasSupportPillars: false,
      roofStyle: "closed",
      hasDoors: true,
      hasCornerPosts: true,
      hasCenterMarker: true,
      cagePreset: "medium",
      gateCount: 2,
      hasVIPPlatform: false,
      creatureDetailLevel: "medium",
      blueprint: "bp",
      commandOutputStyle: "spawnactor",
      chunkSize: 160,
      copyMode: "multiline",
      includeTeleport: true,
      teleportX: 1,
      teleportY: 2,
      teleportZ: 3,
      customFileName: "test",
    });
    expect(p.v).toBe(ARENA_WORKSPACE_PAYLOAD_VERSION);
    expect(p.activeShapeName).toBe(s.name);
  });

  it("apply returns 0 for empty payload", () => {
    const h = mockHandlers();
    expect(applyArenaWorkspacePayload({}, h)).toBe(0);
    expect(h.setMode).not.toHaveBeenCalled();
  });

  it("applies mode and shape preset", () => {
    const h = mockHandlers();
    const sphere = SHAPE_PRESETS.find((x) => x.name === "Sphere");
    expect(sphere).toBeDefined();
    const count = applyArenaWorkspacePayload({ mode: "shape", activeShapeName: "Sphere" }, h);
    expect(count).toBeGreaterThanOrEqual(2);
    expect(h.setMode).toHaveBeenCalledWith("shape");
    expect(h.setActiveShape).toHaveBeenCalledWith(sphere);
    expect(h.setShapeCategory).toHaveBeenCalledWith(sphere?.category);
  });

  it("applies grid and export fields", () => {
    const h = mockHandlers();
    const n = applyArenaWorkspacePayload(
      {
        mode: "grid",
        maxX: 5000,
        maxY: 4000,
        gridStyle: "simpleWalls",
        spawnAnchor: "teleportCenter",
        chunkSize: 210,
        copyMode: "singleline",
        includeTeleport: false,
        teleportX: 100,
        teleportY: 200,
        teleportZ: 50,
      },
      h,
    );
    expect(n).toBeGreaterThanOrEqual(8);
    expect(h.setMaxX).toHaveBeenCalledWith(5000);
    expect(h.setGridStyle).toHaveBeenCalledWith("simpleWalls");
    expect(h.setChunkSize).toHaveBeenCalledWith(210);
    expect(h.setCopyMode).toHaveBeenCalledWith("singleline");
  });
});
