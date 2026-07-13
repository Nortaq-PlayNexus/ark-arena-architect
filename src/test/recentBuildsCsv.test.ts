import { describe, expect, it } from "vitest";
import { recentBuildsToCsv } from "@/lib/recentBuildsCsv";

describe("recentBuildsToCsv", () => {
  it("formats header and escapes quotes in names", () => {
    const csv = recentBuildsToCsv([
      { name: 'Arena "test"', commands: 100, time: 1_700_000_000_000 },
    ]);
    expect(csv.startsWith("name,commands,time_iso\n")).toBe(true);
    expect(csv).toContain('"Arena ""test"""');
    expect(csv).toContain("100");
    expect(csv).toContain("T");
  });

  it("handles empty list", () => {
    expect(recentBuildsToCsv([])).toBe("name,commands,time_iso\n");
  });
});
