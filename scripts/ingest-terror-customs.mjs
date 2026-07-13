/**
 * Ingests "terror customs" cave files into a separate JSON dataset.
 * - Supports extensionless cave files and .txt files.
 * - Normalizes shorthand commands (e.g. "c spawnactor" -> "admincheat spawnactor").
 * - Rewrites mannequin blueprint spawns to TributeTerminal for most maps.
 * - **Gen2** (`Gen2` folder / `terror-gen2`) keeps Genesis 2 loadout mannequins unchanged.
 *
 * Usage:
 *   node scripts/ingest-terror-customs.mjs "C:/path/to/terror-customs"
 *
 * Output: src/data/terrorCustoms.json
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "src", "data", "terrorCustoms.json");

const DEFAULT_DIR =
  process.argv[2] ||
  "C:\\Users\\natha\\OneDrive\\Desktop\\terror customs\\Terror Customs";

const MANNEQUIN_BLUEPRINT =
  "Blueprint'/Game/Genesis2/Structures/LoadoutMannequin/Structure_LoadoutDummy_Hotbar.Structure_LoadoutDummy_Hotbar'";
const TERMINAL_BLUEPRINT =
  "Blueprint'/Game/PrimalEarth/Structures/TributeTerminal_Base.TributeTerminal_Base'";

/** Maps that should keep LoadoutMannequin spawns (Genesis 2 terror folder, e.g. `Gen2`). */
function terrorMapKeepsMannequins(mapName) {
  const key = mapName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return key.startsWith("gen2") || key.includes("genesis2");
}

function isTeleportLine(line) {
  const s = line.trim().replace(/\s*\|\s*$/, "").toLowerCase();
  return (
    s.startsWith("cheat spi") ||
    s.startsWith("admincheat setplayerpos") ||
    s.startsWith("cheat setplayerpos") ||
    s.startsWith("c spi") ||
    s.startsWith("c setplayerpos")
  );
}

function normalizeTeleportLine(line) {
  const core = line.trim().replace(/\s*\|\s*$/, "");
  if (!core) return "";
  const lower = core.toLowerCase();
  if (lower.startsWith("c spi ")) {
    return `cheat spi ${core.slice(6).trim()}`;
  }
  if (lower.startsWith("c setplayerpos ")) {
    return `admincheat setplayerpos ${core.slice(14).trim()}`;
  }
  if (lower.startsWith("cheat setplayerpos ")) {
    return `admincheat setplayerpos ${core.slice(18).trim()}`;
  }
  return core;
}

function normalizeCommand(line, convertMannequinToTerminal) {
  let core = line.trim().replace(/\s*\|\s*$/, "");
  if (!core) return "";
  core = core.replace(/"/g, "\"");

  const lower = core.toLowerCase();
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

  if (isTeleportLine(core)) {
    return normalizeTeleportLine(core);
  }
  return `${core}|`;
}

function parseTeleportLine(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  for (const line of lines) {
    if (isTeleportLine(line)) return normalizeTeleportLine(line);
  }
  return null;
}

function extractCommandsAfterTeleport(raw, convertMannequinToTerminal) {
  const lines = raw.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (isTeleportLine(lines[i])) {
      start = i + 1;
      break;
    }
  }
  const source = start >= 0 ? lines.slice(start) : lines;

  // Files often contain many commands on one line separated by pipes.
  const split = source
    .flatMap((l) => l.split("|"))
    .map((l) => l.trim())
    .filter(Boolean);

  return split
    .map((l) => normalizeCommand(l, convertMannequinToTerminal))
    .filter(Boolean)
    .join("\n");
}

function isCaveFileName(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".zip") || lower.endsWith(".rar") || lower.endsWith(".7z")) return false;
  if (name.startsWith(".")) return false;
  // Accept extensionless files + .txt
  return !lower.includes(".") || lower.endsWith(".txt");
}

async function findMapDirs(baseDir) {
  const found = [];
  async function walk(absDir, relDir) {
    const entries = await fs.readdir(absDir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && isCaveFileName(e.name))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));
    if (files.length > 0) {
      found.push({
        mapDir: absDir,
        mapName: relDir || path.basename(absDir),
        files,
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
    const files = entry.files;
    const caves = [];

    const convertMannequinToTerminal = !terrorMapKeepsMannequins(mapName);
    const placementType = convertMannequinToTerminal ? "wall-terminals" : "open-room";

    for (const file of files) {
      const full = path.join(mapDir, file);
      const raw = await fs.readFile(full, "utf8");
      const teleportLine = parseTeleportLine(raw);
      const fullCommands = extractCommandsAfterTeleport(raw, convertMannequinToTerminal);
      const caveName = file.replace(/\.txt$/i, "");
      caves.push({
        id: `terror-${mapName}/${file}`.replace(/[^a-zA-Z0-9/_-]+/g, "-"),
        fileName: file,
        name: caveName,
        placementType,
        teleportLine: teleportLine || "",
        fullCommands,
      });
    }

    if (caves.length > 0) {
      const rawBaseId = mapName.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
      const baseId = `terror-${rawBaseId || "map"}`;
      let mapId = baseId;
      let n = 2;
      while (usedMapIds.has(mapId)) {
        mapId = `${baseId}-${n++}`;
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
  console.log(`Wrote ${OUT} (${payload.mapCount} maps, ${payload.caveCount} caves)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
