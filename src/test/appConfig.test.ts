import { describe, expect, it, vi } from "vitest";
import { appEnvSchema, parseAppEnv } from "@/lib/appConfig";

describe("parseAppEnv", () => {
  it("accepts a valid Vite-shaped env", () => {
    const env = parseAppEnv({
      MODE: "test",
      DEV: true,
      PROD: false,
      VITE_APP_TITLE: "  My Title  ",
    });
    expect(env.MODE).toBe("test");
    expect(env.VITE_APP_TITLE).toBe("My Title");
  });

  it("trims and caps title length", () => {
    const long = "x".repeat(200);
    const env = parseAppEnv({
      MODE: "production",
      DEV: false,
      PROD: true,
      VITE_APP_TITLE: long,
    });
    expect(env.VITE_APP_TITLE?.length).toBe(120);
  });

  it("treats blank title as undefined", () => {
    const env = parseAppEnv({
      MODE: "development",
      DEV: true,
      PROD: false,
      VITE_APP_TITLE: "   ",
    });
    expect(env.VITE_APP_TITLE).toBeUndefined();
  });

  it("recovers from invalid MODE via safe defaults", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const env = parseAppEnv({
      MODE: "",
      DEV: false,
      PROD: true,
      VITE_APP_TITLE: undefined,
    });
    expect(env.MODE).toBe("development");
    warn.mockRestore();
  });
});

describe("appEnvSchema", () => {
  it("rejects MODE longer than 64 chars when used directly", () => {
    const longMode = "m".repeat(80);
    const r = appEnvSchema.safeParse({
      MODE: longMode,
      DEV: true,
      PROD: false,
      VITE_APP_TITLE: undefined,
    });
    expect(r.success).toBe(false);
  });
});
