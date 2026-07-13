/**
 * Admin spawnactor line generators (ported from workspace root Terminal.py / terminalwall.py).
 * Output matches those scripts: admincheat spawnactor "<blueprint>" X Z Y|
 */

export const DEFAULT_TRIBUTE_BLUEPRINT =
  "Blueprint'/Game/PrimalEarth/Structures/TributeTerminal_Base.TributeTerminal_Base'";

/** Hard cap to avoid freezing the browser on huge grids. */
export const MAX_SPAWN_GRID_COMMANDS = 100_000;

export function countNestedBoxCommands(sizeX: number, sizeY: number, sizeZ: number): number {
  const sx = Math.abs(Math.trunc(sizeX));
  const sy = Math.abs(Math.trunc(sizeY));
  const sz = Math.abs(Math.trunc(sizeZ));
  return sx * sy * sz;
}

export function countXzWallCommands(xStep: number, zStep: number, maxX: number, maxZ: number): number {
  const xs = Math.trunc(xStep);
  const zs = Math.trunc(zStep);
  if (xs <= 0 || zs <= 0) return 0;
  const mx = Math.max(0, Math.trunc(maxX));
  const mz = Math.max(0, Math.trunc(maxZ));
  const nx = Math.floor(mx / xs) + 1;
  const nz = Math.floor(mz / zs) + 1;
  return nx * nz;
}

export type NestedBoxParams = {
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  blueprint: string;
};

export function generateNestedBoxSpawnCommands(params: NestedBoxParams): string[] {
  const sx = Math.abs(Math.trunc(params.sizeX));
  const sy = Math.abs(Math.trunc(params.sizeY));
  const sz = Math.abs(Math.trunc(params.sizeZ));
  const dirX = params.sizeX >= 0 ? 1 : -1;
  const dirY = params.sizeY >= 0 ? 1 : -1;
  const dirZ = params.sizeZ >= 0 ? 1 : -1;
  const ox = Math.trunc(params.offsetX);
  const oy = Math.trunc(params.offsetY);
  const oz = Math.trunc(params.offsetZ);
  const bp = (params.blueprint.trim() || DEFAULT_TRIBUTE_BLUEPRINT).replace(/"/g, '\\"');

  const lines: string[] = [];
  for (let x = 0; x < sx; x++) {
    for (let z = 0; z < sz; z++) {
      for (let y = 0; y < sy; y++) {
        const spawnX = x * ox * dirX;
        const spawnZ = z * oz * dirZ;
        const spawnY = y * oy * dirY;
        lines.push(`admincheat spawnactor "${bp}" ${spawnX} ${spawnZ} ${spawnY}|`);
      }
    }
  }
  return lines;
}

export type XzWallParams = {
  xStep: number;
  zStep: number;
  maxX: number;
  maxZ: number;
  blueprint: string;
};

export function generateXzWallSpawnCommands(params: XzWallParams): string[] {
  const xs = Math.trunc(params.xStep);
  const zs = Math.trunc(params.zStep);
  if (xs <= 0 || zs <= 0) return [];
  const mx = Math.max(0, Math.trunc(params.maxX));
  const mz = Math.max(0, Math.trunc(params.maxZ));
  const bp = (params.blueprint.trim() || DEFAULT_TRIBUTE_BLUEPRINT).replace(/"/g, '\\"');

  const lines: string[] = [];
  for (let x = 0; x <= mx; x += xs) {
    for (let z = 0; z <= mz; z += zs) {
      lines.push(`admincheat spawnactor "${bp}" ${x} 0 ${z}|`);
    }
  }
  return lines;
}
