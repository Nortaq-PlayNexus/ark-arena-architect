/**
 * One-shot: multiply spatial fields in SHAPE_PRESETS and GRID_TEMPLATES by 100.
 * Run from repo: node scripts/scale-templates-100x.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function scaleShapePresets(text) {
  const start = text.indexOf("export const SHAPE_PRESETS: ShapeConfig[] = [");
  const end = text.indexOf("\n];\n\n/** Counts per category", start);
  if (start < 0 || end < 0) throw new Error("SHAPE_PRESETS block not found");
  const before = text.slice(0, start);
  const block = text.slice(start, end);
  const after = text.slice(end);
  const lines = block.split("\n");
  const out = lines.map((line) => {
    const t = line.trim();
    if (!t.startsWith("{ name:")) return line;
    return line
      .replace(/centerX: (\d+)/g, (_, n) => `centerX: ${Number(n) * 100}`)
      .replace(/centerY: (\d+)/g, (_, n) => `centerY: ${Number(n) * 100}`)
      .replace(/centerZ: (\d+)/g, (_, n) => `centerZ: ${Number(n) * 100}`)
      .replace(/radius: (\d+)/g, (_, n) => `radius: ${Number(n) * 100}`)
      .replace(/step: (\d+)/g, (_, n) => `step: ${Number(n) * 100}`);
  });
  return before + out.join("\n") + after;
}

const GRID_SPATIAL_KEYS = new Set([
  "maxX",
  "maxY",
  "xStep",
  "yStep",
  "gridZ",
  "simpleWallWidth",
  "simpleWallDepth",
  "simpleWallStep",
  "simpleWallThicknessSpacing",
  "gridWallZOffset",
  "gridWallHeight",
  "gridWallVerticalStep",
  "gridWallThicknessSpacing",
]);

function scaleGridTemplates(text) {
  const start = text.indexOf("export const GRID_TEMPLATES: GridTemplate[] = [");
  const end = text.indexOf("\n];\n\nexport const GRID_TEMPLATE_CATEGORIES", start);
  if (start < 0 || end < 0) throw new Error("GRID_TEMPLATES block not found");
  const before = text.slice(0, start);
  let block = text.slice(start, end);
  const after = text.slice(end);
  for (const key of GRID_SPATIAL_KEYS) {
    const re = new RegExp(`(${key}: )(\\d+)`, "g");
    block = block.replace(re, (_, p, n) => `${p}${Number(n) * 100}`);
  }
  return before + block + after;
}

const sg = path.join(root, "src", "lib", "shapeGenerators.ts");
const gt = path.join(root, "src", "lib", "gridTemplates.ts");

let shapeText = fs.readFileSync(sg, "utf8");
if (!shapeText.includes("centerX: 5000,")) {
  console.warn("shapeGenerators: expected centerX: 5000 — already scaled or unexpected; aborting.");
  process.exit(1);
}
shapeText = scaleShapePresets(shapeText);
fs.writeFileSync(sg, shapeText);
console.log("Updated", sg);

let gridText = fs.readFileSync(gt, "utf8");
if (!gridText.includes("maxX: 6000,")) {
  console.warn("gridTemplates: expected maxX: 6000 in Tight floor — already scaled or unexpected; aborting.");
  process.exit(1);
}
gridText = scaleGridTemplates(gridText);
fs.writeFileSync(gt, gridText);
console.log("Updated", gt);
