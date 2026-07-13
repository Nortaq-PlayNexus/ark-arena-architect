import { z } from "zod";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "ark-master:cluster-metrics:v1";
const MAX_POINTS = 200;

const pointSchema = z.object({
  t: z.number(),
  totalPlayers: z.number().int().min(0),
  onlineServers: z.number().int().min(0),
});

export type ClusterMetricPoint = z.infer<typeof pointSchema>;

function loadRaw(): ClusterMetricPoint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    const arr = z.array(pointSchema).safeParse(data);
    if (!arr.success) {
      logger.warn("clusterMetrics: invalid series", arr.error.flatten());
      return [];
    }
    return arr.data;
  } catch (e) {
    logger.warn("clusterMetrics: read failed", e);
    return [];
  }
}

function saveRaw(points: ClusterMetricPoint[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
  } catch (e) {
    logger.warn("clusterMetrics: write failed", e);
  }
}

export function loadClusterMetrics(): ClusterMetricPoint[] {
  return loadRaw();
}

export function appendClusterMetricSnapshot(input: {
  totalPlayers: number;
  onlineServers: number;
}): ClusterMetricPoint[] {
  const next = [
    ...loadRaw(),
    { t: Date.now(), totalPlayers: input.totalPlayers, onlineServers: input.onlineServers },
  ].slice(-MAX_POINTS);
  saveRaw(next);
  return next;
}

export function clearClusterMetrics(): void {
  saveRaw([]);
}

export function metricsChartRows(points: ClusterMetricPoint[]): {
  time: string;
  players: number;
  online: number;
}[] {
  return points.map((p) => ({
    time: new Date(p.t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    players: p.totalPlayers,
    online: p.onlineServers,
  }));
}
