/**
 * Scans a "finished maps" folder (map subfolders → .txt cave files).
 * Extracts the first teleport line (cheat spi … or admincheat SetPlayerPos …).
 *
 * Usage:
 *   node scripts/ingest-custom-caves.mjs "C:/path/to/maps-folder"
 *   npm run ingest:caves   (uses Desktop/Arena Caves Imports by default)
 *
 * Output: src/data/customCaves.json
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "src", "data", "customCaves.json");

const DEFAULT_DESKTOP_CAVES_DIR =
  "C:\\Users\\natha\\OneDrive\\Desktop\\Arena Caves Imports";

const DEFAULT_DIR =
  process.argv[2] ||
  DEFAULT_DESKTOP_CAVES_DIR;

const MANNEQUIN_BLUEPRINT =
  "Blueprint'/Game/Genesis2/Structures/LoadoutMannequin/Structure_LoadoutDummy_Hotbar.Structure_LoadoutDummy_Hotbar'";
const TERMINAL_BLUEPRINT =
  "Blueprint'/Game/PrimalEarth/Structures/TributeTerminal_Base.TributeTerminal_Base'";

function normalizeMapKey(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Genesis 2 custom caves keep loadout mannequins (same as Terror Gen2 ingest). */
function mapKeepsGenesis2Mannequins(mapName) {
  const key = normalizeMapKey(mapName);
  return key.startsWith("gen2") || key.includes("genesis2");
}

function parseTeleportLine(raw) {
  const lines = raw
    .split(/\r?\n/)
    .flatMap((l) => l.split("|"))
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith("cheat spi") || lower.startsWith("admincheat setplayerpos")) {
      return line.replace(/\s*\|\s*$/, "").trim();
    }
  }
  return null;
}

/** Lines after teleport; each spawn/command line ends with | (ARK console paste format). Teleport never included here. */
function normalizeLineAfterTeleport(line, convertMannequinToTerminal) {
  let core = line.replace(/\s*\|\s*$/, "").trim();
  if (!core) return "";
  const lower = core.toLowerCase();
  if (lower.startsWith("cheat spi") || lower.startsWith("admincheat setplayerpos")) {
    return core;
  }
  if (lower.startsWith("c spawnactor ")) {
    core = `admincheat spawnactor ${core.slice(12).trim()}`;
  } else if (lower.startsWith("cheat spawnactor ")) {
    core = `admincheat spawnactor ${core.slice(16).trim()}`;
  }
  if (convertMannequinToTerminal) {
    core = core.replaceAll(MANNEQUIN_BLUEPRINT, TERMINAL_BLUEPRINT);
    core = core.replaceAll("LoadoutMannequin", "TributeTerminal_Base");
    core = core.replaceAll("Structure_LoadoutDummy_Hotbar", "TributeTerminal_Base");
  }
  return `${core}|`;
}

function extractCommandsAfterTeleport(raw, convertMannequinToTerminal) {
  const lines = raw
    .split(/\r?\n/)
    .flatMap((l) => l.split("|"))
    .map((l) => l.trim())
    .filter(Boolean);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i];
    if (!t) continue;
    const lower = t.toLowerCase();
    if (lower.startsWith("cheat spi") || lower.startsWith("admincheat setplayerpos")) {
      start = i + 1;
      break;
    }
  }
  const rest =
    start >= 0
      ? lines.slice(start)
      : lines;
  return rest
    .map((l) => normalizeLineAfterTeleport(l, convertMannequinToTerminal))
    .filter((l) => l.length > 0)
    .join("\n");
}

/** Recursively finds directories that contain at least one .txt cave file. */
async function findMapDirs(baseDir) {
  const found = [];
  async function walk(absDir, relDir) {
    const entries = await fs.readdir(absDir, { withFileTypes: true });
    const txtFiles = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".txt"))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));
    if (txtFiles.length > 0) {
      found.push({
        mapDir: absDir,
        mapName: relDir || path.basename(absDir),
        txtFiles,
      });
    }
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const childAbs = path.join(absDir, ent.name);
      const childRel = relDir ? path.join(relDir, ent.name) : ent.name;
      await walk(childAbs, childRel);
    }
  }
  await walk(baseDir, "");
  return found;
}

async function main() {
  const base = path.resolve(DEFAULT_DIR);
  let mapDirs;
  try {
    await fs.mkdir(base, { recursive: true });
    mapDirs = await findMapDirs(base);
  } catch (e) {
    console.error("Cannot read directory:", base, e.message);
    process.exit(1);
  }

  const maps = [];
  const usedMapIds = new Set();

  for (const entry of mapDirs) {
    const mapName = entry.mapName;
    const mapDir = entry.mapDir;
    const txtFiles = entry.txtFiles;
    const keepMannequins = mapKeepsGenesis2Mannequins(mapName);
    const convertMannequinToTerminal = !keepMannequins;

    const caves = [];
    for (const file of txtFiles) {
      const full = path.join(mapDir, file);
      const raw = await fs.readFile(full, "utf8");
      const teleportLine = parseTeleportLine(raw);
      const fullCommands = extractCommandsAfterTeleport(raw, convertMannequinToTerminal);
      const caveName = file.replace(/\.txt$/i, "");
      caves.push({
        id: `${mapName}/${file}`.replace(/[^a-zA-Z0-9/_-]+/g, "-"),
        fileName: file,
        name: caveName,
        teleportLine: teleportLine || "",
        fullCommands,
        ...(keepMannequins ? { placementType: "open-room" } : {}),
      });
    }

    if (caves.length > 0) {
      const baseMapId = mapName.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
      let mapId = baseMapId || "map";
      let n = 2;
      while (usedMapIds.has(mapId)) {
        mapId = `${baseMapId}-${n++}`;
      }
      usedMapIds.add(mapId);
      maps.push({
        id: mapId,
        name: mapName,
        caves,
      });
    }
  }

  maps.sort((a, b) => a.name.localeCompare(b.name));

  const payload = {
    sourceDir: base,
    generatedAt: new Date().toISOString(),
    mapCount: maps.length,
    caveCount: maps.reduce((n, m) => n + m.caves.length, 0),
    maps,
  };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(payload, null, 2), "utf8");
  console.log(
    `Wrote ${OUT} (${payload.mapCount} maps, ${payload.caveCount} caves)`
  );
  if (payload.mapCount === 0) {
    console.log(`Drop map folders with .txt caves into: ${base}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
