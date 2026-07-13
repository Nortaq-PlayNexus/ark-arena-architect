import { describe, expect, it } from "vitest";
import {
  countNestedBoxCommands,
  countXzWallCommands,
  DEFAULT_TRIBUTE_BLUEPRINT,
  generateNestedBoxSpawnCommands,
  generateXzWallSpawnCommands,
} from "@/lib/spawnGridGenerators";

describe("spawnGridGenerators", () => {
  it("nested box 1x1x1 produces one command", () => {
    const lines = generateNestedBoxSpawnCommands({
      sizeX: 1,
      sizeY: 1,
      sizeZ: 1,
      offsetX: 300,
      offsetY: 500,
      offsetZ: 300,
      blueprint: DEFAULT_TRIBUTE_BLUEPRINT,
    });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("admincheat spawnactor");
    expect(lines[0]).toContain("0 0 0");
    expect(lines[0]).toMatch(/\|$/);
  });

  it("nested box negative size applies direction to offsets", () => {
    const lines = generateNestedBoxSpawnCommands({
      sizeX: -2,
      sizeY: 1,
      sizeZ: 1,
      offsetX: 100,
      offsetY: 1,
      offsetZ: 1,
      blueprint: "Blueprint'/Game/Test.Test'",
    });
    expect(lines).toHaveLength(2);
    expect(lines[1]).toMatch(/-100 0 0\|$/);
  });

  it("counts nested volume", () => {
    expect(countNestedBoxCommands(2, 3, 4)).toBe(24);
  });

  it("XZ wall matches inclusive stepped grid", () => {
    expect(countXzWallCommands(300, 500, 0, 0)).toBe(1);
    const lines = generateXzWallSpawnCommands({
      xStep: 300,
      zStep: 500,
      maxX: 600,
      maxZ: 500,
      blueprint: DEFAULT_TRIBUTE_BLUEPRINT,
    });
    expect(lines.length).toBe(countXzWallCommands(300, 500, 600, 500));
    expect(lines[0]).toContain(" 0 0 ");
  });

  it("returns empty for invalid wall steps", () => {
    expect(generateXzWallSpawnCommands({ xStep: 0, zStep: 100, maxX: 100, maxZ: 100, blueprint: "" })).toEqual([]);
  });
});
