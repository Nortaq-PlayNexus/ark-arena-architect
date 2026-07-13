import { describe, expect, it } from "vitest";
import { SHAPE_PRESETS, generateShape } from "@/lib/shapeGenerators";

const BP = `"Blueprint'/Game/PrimalEarth/Structures/TributeTerminal_Base.TributeTerminal_Base'"`;

function quickHash(lines: string[]): string {
  let h = 2166136261;
  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      h ^= line.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return (h >>> 0).toString(16);
}

describe("preset generation snapshots", () => {
  it("keeps representative preset outputs stable", () => {
    const picks = ["Sphere", "Maze", "Colosseum", "Nuketown (inspired)", "Rex", "Spinosaurus"];
    const out: Record<string, { count: number; hash: string }> = {};
    for (const name of picks) {
      const preset = SHAPE_PRESETS.find((p) => p.name === name);
      if (!preset) continue;
      const cmds = generateShape({ ...preset, seed: 123456 }, BP);
      out[name] = { count: cmds.length, hash: quickHash(cmds.slice(0, 1500)) };
    }
    expect(out).toMatchSnapshot();
  });
});
