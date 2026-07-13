import { describe, expect, it } from "vitest";
import {
  buildIniSnippet,
  deleteSnippet,
  exportIniLibraryJson,
  mergeIniLibraryImportJson,
  upsertSnippet,
  type IniLibraryState,
} from "@/lib/iniSnippetLibrary";

const a = buildIniSnippet({ title: "A", category: "engine", content: "[Foo]\nBar=1\n" });
const b = buildIniSnippet({ title: "B", category: "other", content: "; hi" });

describe("iniSnippetLibrary", () => {
  it("exports and merges backup JSON", () => {
    const state: IniLibraryState = { snippets: [a] };
    const json = exportIniLibraryJson(state);
    expect(json).toContain("ark-master-ini-library");
    const merged = mergeIniLibraryImportJson(json, { snippets: [b] });
    expect(merged).not.toBeNull();
    expect(merged!.snippets.length).toBe(2);
  });

  it("merges plain array import", () => {
    const arr = JSON.stringify([a, b]);
    const merged = mergeIniLibraryImportJson(arr, { snippets: [] });
    expect(merged?.snippets).toHaveLength(2);
  });

  it("upserts and deletes", () => {
    let state: IniLibraryState = { snippets: [] };
    state = upsertSnippet(state, a);
    expect(state.snippets).toHaveLength(1);
    const updated = { ...a, content: "x" };
    state = upsertSnippet(state, updated);
    expect(state.snippets[0].content).toBe("x");
    state = deleteSnippet(state, a.id);
    expect(state.snippets).toHaveLength(0);
  });

  it("rejects invalid import", () => {
    expect(mergeIniLibraryImportJson("{", { snippets: [] })).toBeNull();
    expect(mergeIniLibraryImportJson("{}", { snippets: [] })).toBeNull();
  });
});
