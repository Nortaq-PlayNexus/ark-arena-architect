import { z } from "zod";
import type { CustomCaveMap } from "@/lib/customCavesCatalog";

const presetConfigSchema = z.record(z.unknown());
const presetsSchema = z.record(presetConfigSchema);
const presetsPayloadSchema = z.union([
  z.object({ presets: presetsSchema }),
  presetsSchema,
]);

const caveSchema = z.object({
  id: z.string(),
  fileName: z.string().optional(),
  name: z.string(),
  placementType: z.string().optional(),
  teleportLine: z.string().optional(),
  fullCommands: z.string().optional(),
});

const caveMapSchema = z.object({
  id: z.string(),
  name: z.string(),
  caves: z.array(caveSchema),
});

const cavesPayloadSchema = z.union([
  z.object({ maps: z.array(caveMapSchema) }),
  z.array(caveMapSchema),
]);

export function parsePresetsImport(payload: unknown): Record<string, Record<string, unknown>> | null {
  const parsed = presetsPayloadSchema.safeParse(payload);
  if (!parsed.success) return null;
  const base = (
    typeof parsed.data === "object" &&
    parsed.data !== null &&
    "presets" in parsed.data
      ? (parsed.data as { presets: Record<string, unknown> }).presets
      : parsed.data
  ) as Record<string, unknown>;
  const clean: Record<string, Record<string, unknown>> = {};
  for (const [k, v] of Object.entries(base)) {
    if (!v || typeof v !== "object" || Array.isArray(v)) continue;
    clean[k] = v as Record<string, unknown>;
  }
  return clean;
}

export function parseCavesImport(payload: unknown): CustomCaveMap[] | null {
  const parsed = cavesPayloadSchema.safeParse(payload);
  if (!parsed.success) return null;
  const maps = Array.isArray(parsed.data) ? parsed.data : parsed.data.maps;
  return maps.map((m) => ({
    id: m.id,
    name: m.name,
    caves: m.caves.map((c) => ({
      id: c.id,
      fileName: c.fileName ?? `${m.id}.txt`,
      name: c.name,
      placementType: c.placementType ?? "wall-terminals",
      teleportLine: c.teleportLine ?? "",
      fullCommands: c.fullCommands ?? "",
    })),
  }));
}
