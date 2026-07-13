import { z } from "zod";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "ark-master:cluster-registry:v1";

export const clusterServerSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1).max(120),
  mapId: z.string().min(1).max(120),
  online: z.boolean(),
  playerCount: z.number().int().min(0),
  maxPlayers: z.number().int().min(1).max(500),
  note: z.string().max(500).optional(),
});

export const clusterAlertSchema = z.object({
  id: z.string().min(1),
  level: z.enum(["critical", "warning", "info"]),
  message: z.string().min(1).max(500),
  createdAt: z.string().min(1),
});

export const clusterStateSchema = z.object({
  servers: z.array(clusterServerSchema),
  alerts: z.array(clusterAlertSchema),
});

export type ClusterServer = z.infer<typeof clusterServerSchema>;
export type ClusterAlert = z.infer<typeof clusterAlertSchema>;
export type ClusterState = z.infer<typeof clusterStateSchema>;

const emptyState: ClusterState = { servers: [], alerts: [] };

function safeParse(raw: unknown): ClusterState {
  const r = clusterStateSchema.safeParse(raw);
  if (!r.success) {
    logger.warn("clusterRegistry: invalid stored state, resetting", r.error.flatten());
    return { ...emptyState };
  }
  return r.data;
}

export function loadClusterState(): ClusterState {
  if (typeof window === "undefined") return { ...emptyState };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyState };
    return safeParse(JSON.parse(raw) as unknown);
  } catch (e) {
    logger.warn("clusterRegistry: read failed", e);
    return { ...emptyState };
  }
}

export function saveClusterState(state: ClusterState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    logger.warn("clusterRegistry: write failed", e);
  }
}

export function newServerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `srv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultServer(partial?: Partial<ClusterServer>): ClusterServer {
  return {
    id: partial?.id ?? newServerId(),
    displayName: partial?.displayName ?? "New server",
    mapId: partial?.mapId ?? "TheIsland_WP",
    online: partial?.online ?? false,
    playerCount: partial?.playerCount ?? 0,
    maxPlayers: partial?.maxPlayers ?? 70,
    note: partial?.note,
  };
}

export function clusterSummary(state: ClusterState): {
  onlineCount: number;
  offlineCount: number;
  totalPlayers: number;
  maxCapacity: number;
} {
  let onlineCount = 0;
  let totalPlayers = 0;
  let maxCapacity = 0;
  for (const s of state.servers) {
    if (s.online) {
      onlineCount += 1;
      totalPlayers += s.playerCount;
      maxCapacity += s.maxPlayers;
    }
  }
  return {
    onlineCount,
    offlineCount: state.servers.length - onlineCount,
    totalPlayers,
    maxCapacity,
  };
}

export function exportClusterJson(state: ClusterState): string {
  return JSON.stringify(state, null, 2);
}

export function importClusterJson(text: string): ClusterState | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    return safeParse(parsed);
  } catch {
    return null;
  }
}
