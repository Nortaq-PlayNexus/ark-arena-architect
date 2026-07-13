import { describe, expect, it } from "vitest";
import { buildCommandsCsvContent, escapeCsvField } from "@/lib/commandsCsv";

describe("escapeCsvField", () => {
  it("leaves simple spawn lines unquoted", () => {
    expect(escapeCsvField("cheat summon Rex_Character_BP_C")).toBe("cheat summon Rex_Character_BP_C");
  });

  it("quotes fields with commas", () => {
    expect(escapeCsvField("a,b")).toBe(`"a,b"`);
  });

  it("doubles embedded quotes", () => {
    expect(escapeCsvField(`say "hi"`)).toBe(`"say ""hi"""`);
  });

  it("quotes newlines", () => {
    expect(escapeCsvField("line1\nline2")).toBe(`"line1\nline2"`);
  });
});

describe("buildCommandsCsvContent", () => {
  it("includes header and CRLF line endings", () => {
    const out = buildCommandsCsvContent(["cmd_a", "cmd_b"]);
    expect(out.startsWith("command\r\n")).toBe(true);
    expect(out.endsWith("\r\n")).toBe(true);
    expect(out).toContain("cmd_a");
    expect(out).toContain("cmd_b");
  });
});
