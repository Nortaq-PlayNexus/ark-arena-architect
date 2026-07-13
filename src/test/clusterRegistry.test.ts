import { describe, expect, it } from "vitest";
import {
  clusterSummary,
  exportClusterJson,
  importClusterJson,
  type ClusterState,
} from "@/lib/clusterRegistry";

const sample: ClusterState = {
  servers: [
    {
      id: "a",
      displayName: "Island",
      mapId: "TheIsland_WP",
      online: true,
      playerCount: 12,
      maxPlayers: 70,
    },
    {
      id: "b",
      displayName: "Scorched",
      mapId: "ScorchedEarth_WP",
      online: false,
      playerCount: 0,
      maxPlayers: 50,
    },
  ],
  alerts: [{ id: "x", level: "info", message: "wip", createdAt: new Date().toISOString() }],
};

describe("clusterRegistry", () => {
  it("round-trips export/import", () => {
    const text = exportClusterJson(sample);
    const back = importClusterJson(text);
    expect(back).toEqual(sample);
  });

  it("rejects malformed JSON text", () => {
    expect(importClusterJson("{")).toBeNull();
  });

  it("summarizes online capacity", () => {
    const s = clusterSummary(sample);
    expect(s.onlineCount).toBe(1);
    expect(s.totalPlayers).toBe(12);
    expect(s.maxCapacity).toBe(70);
  });
});
