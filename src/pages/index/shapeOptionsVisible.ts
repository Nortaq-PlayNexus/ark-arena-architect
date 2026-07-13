import type { ShapeCategory } from "@/lib/shapeGenerators";

/** True when ShapeOptionsPanel renders non-null UI (kept in sync with panel branches). */
export function shapeOptionsVisible(activeShapeName: string, shapeCategory: ShapeCategory): boolean {
  const name = activeShapeName;
  const mazeLike =
    name === "Maze" ||
    name === "Micro Maze" ||
    name === "Mega Maze" ||
    name === "Winter Maze" ||
    name === "Citadel Maze" ||
    name === "Labyrinth Prime" ||
    name === "Apex Labyrinth";
  if (mazeLike) return true;
  const courseLike =
    name === "Obstacle Course" ||
    name === "Serpentine Course" ||
    name === "Circuit Run" ||
    name === "Endurance Run" ||
    name === "Switchback Sprint" ||
    name === "Wave Rider Course" ||
    name === "Vortex Run" ||
    name === "Ironman Sprint" ||
    name === "Precision Parkour";
  if (courseLike) return true;
  if (name === "Tower Arena") return true;
  if (name === "Colosseum" || name === "Spectacle Bowl") return true;
  if (name === "Cage Match") return true;
  if (name === "Sky Ring") return true;
  const gauntletLike =
    name === "Lava Run" ||
    name === "Parkour Tower" ||
    name === "Dropper Tower" ||
    name === "Island Gauntlet" ||
    name === "Atoll Gauntlet" ||
    name === "Gauntlet" ||
    name === "Siege Corridor" ||
    name === "Summit Ascent" ||
    name === "Abyss Dropper" ||
    name === "Icebreaker Spleef" ||
    name === "Ember Crossing" ||
    name === "Ruins Pit";
  if (gauntletLike) return true;
  if (shapeCategory === "creatures") return true;
  return false;
}
