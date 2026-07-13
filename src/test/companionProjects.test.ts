import { describe, expect, it } from "vitest";
import {
  COMPANION_PROJECTS,
  companionProjectIds,
  exportCompanionLaunchRegistryJson,
} from "@/core/companionProjects";

describe("companionProjects", () => {
  it("exports parseable launch registry JSON", () => {
    const raw = exportCompanionLaunchRegistryJson();
    const data = JSON.parse(raw) as unknown;
    expect(Array.isArray(data)).toBe(true);
    expect((data as typeof COMPANION_PROJECTS).length).toBe(COMPANION_PROJECTS.length);
  });

  it("has unique ids and non-empty scripts", () => {
    const ids = companionProjectIds();
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of COMPANION_PROJECTS) {
      expect(p.relativeRoot.length).toBeGreaterThan(0);
      expect(p.steps.length).toBeGreaterThan(0);
      for (const s of p.steps) {
        expect(s.script.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
