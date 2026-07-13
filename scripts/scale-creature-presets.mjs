/**
 * Scale creature SHAPE_PRESETS: radius ÷25, step 300 (buildable density).
 * Run: node scripts/scale-creature-presets.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, "..", "src", "lib", "shapeGenerators.ts");
let lines = fs.readFileSync(p, "utf8").split("\n");

lines = lines.map((line) => {
  if (line.includes('category: "creatures"') && line.includes("step: 4800")) {
    return line.replace(/radius: (\d+), step: 4800/, (_, r) => {
      const nr = Math.round(Number(r) / 25);
      return `radius: ${nr}, step: 300`;
    });
  }
  return line;
});

fs.writeFileSync(p, lines.join("\n"));
console.log("Scaled remaining creature presets.");
