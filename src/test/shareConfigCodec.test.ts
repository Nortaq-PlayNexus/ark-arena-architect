import { describe, it, expect } from "vitest";
import { decodeConfig, encodeConfig } from "@/lib/shareConfigCodec";

describe("shareConfigCodec", () => {
  it("round-trips flat JSON", () => {
    const cfg = { activeShapeName: "Test", shapeRadius: 1200 };
    const enc = encodeConfig(cfg);
    expect(enc.length).toBeGreaterThan(0);
    expect(decodeConfig(enc)).toEqual(cfg);
  });

  it("round-trips UTF-8 (no escape/unescape)", () => {
    const cfg = { label: "Fjordur · 测试 🦕", n: 1 };
    const enc = encodeConfig(cfg);
    expect(decodeConfig(enc)).toEqual(cfg);
  });

  it("returns null for invalid base64 / JSON", () => {
    expect(decodeConfig("not!!!")).toBeNull();
    expect(decodeConfig(btoa("not json"))).toBeNull();
  });

  it("returns empty string when JSON.stringify throws", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(encodeConfig(cyclic)).toBe("");
  });
});
