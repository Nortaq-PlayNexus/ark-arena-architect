export type CustomCaveEntry = {
  id: string;
  fileName: string;
  name: string;
  /** User intent for how this cave should be built in-game. */
  placementType: string;
  teleportLine: string;
  /** Lines after the teleport line; each spawn/admin line ends with | for ARK console. */
  fullCommands: string;
};

export type CustomCaveMap = {
  id: string;
  name: string;
  caves: CustomCaveEntry[];
};

export type CustomCavesPayload = {
  sourceDir: string;
  generatedAt: string;
  mapCount: number;
  caveCount: number;
  maps: CustomCaveMap[];
};

/** Starts loading the JSON chunk early (e.g. Caves button hover) so it may be cached before the panel mounts. */
export function prefetchCustomCavesCatalog(): void {
  void import("@/data/customCaves.json");
  void import("@/data/terrorCustoms.json");
}

/** Loads the bundled cave dataset asynchronously so it is not inlined into the main panel chunk. */
export async function loadCustomCavesCatalog(): Promise<CustomCavesPayload> {
  const mod = await import("@/data/customCaves.json");
  return mod.default as CustomCavesPayload;
}

/** Loads terror customs dataset (separate app section). */
export async function loadTerrorCustomsCatalog(): Promise<CustomCavesPayload> {
  const mod = await import("@/data/terrorCustoms.json");
  return mod.default as CustomCavesPayload;
}
