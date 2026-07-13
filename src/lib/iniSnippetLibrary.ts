import { z } from "zod";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "ark-master:ini-library:v1";
export const MAX_INI_SNIPPET_CHARS = 200_000;
export const MAX_INI_SNIPPETS = 250;

export const iniSnippetCategorySchema = z.enum(["game_user_settings", "engine", "input", "other"]);
export type IniSnippetCategory = z.infer<typeof iniSnippetCategorySchema>;

export const iniSnippetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  category: iniSnippetCategorySchema,
  content: z.string().max(MAX_INI_SNIPPET_CHARS),
  updatedAt: z.string().min(1),
});

export type IniSnippet = z.infer<typeof iniSnippetSchema>;

const stateSchema = z.object({
  snippets: z.array(iniSnippetSchema),
});

export type IniLibraryState = z.infer<typeof stateSchema>;

const emptyState: IniLibraryState = { snippets: [] };

function safeParseState(raw: unknown): IniLibraryState {
  const r = stateSchema.safeParse(raw);
  if (!r.success) {
    logger.warn("iniSnippetLibrary: invalid stored state", r.error.flatten());
    return { ...emptyState };
  }
  if (r.data.snippets.length > MAX_INI_SNIPPETS) {
    return { snippets: r.data.snippets.slice(0, MAX_INI_SNIPPETS) };
  }
  return r.data;
}

export function loadIniLibraryState(): IniLibraryState {
  if (typeof window === "undefined") return { ...emptyState };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyState };
    return safeParseState(JSON.parse(raw) as unknown);
  } catch (e) {
    logger.warn("iniSnippetLibrary: read failed", e);
    return { ...emptyState };
  }
}

export function saveIniLibraryState(state: IniLibraryState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    logger.warn("iniSnippetLibrary: write failed", e);
  }
}

/** Remove INI library data from this browser (Settings “clear” action). */
export function clearIniLibraryStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    logger.warn("iniSnippetLibrary: clear failed", e);
  }
}

export function newIniSnippetId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ini-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildIniSnippet(partial: {
  title: string;
  category: IniSnippetCategory;
  content: string;
  id?: string;
}): IniSnippet {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? newIniSnippetId(),
    title: partial.title.trim().slice(0, 200),
    category: partial.category,
    content: partial.content.slice(0, MAX_INI_SNIPPET_CHARS),
    updatedAt: now,
  };
}

export function upsertSnippet(state: IniLibraryState, snippet: IniSnippet): IniLibraryState {
  const idx = state.snippets.findIndex((s) => s.id === snippet.id);
  const next = [...state.snippets];
  if (idx >= 0) next[idx] = { ...snippet, updatedAt: new Date().toISOString() };
  else {
    if (next.length >= MAX_INI_SNIPPETS) {
      return state;
    }
    next.push(snippet);
  }
  return { snippets: next };
}

export function deleteSnippet(state: IniLibraryState, id: string): IniLibraryState {
  return { snippets: state.snippets.filter((s) => s.id !== id) };
}

export const INI_LIBRARY_EXPORT_SCHEMA = "ark-master-ini-library";

export type IniLibraryFileExport = {
  schema: typeof INI_LIBRARY_EXPORT_SCHEMA;
  schemaVersion: 1;
  exportedAt: string;
  snippets: IniSnippet[];
};

export function exportIniLibraryJson(state: IniLibraryState): string {
  const payload: IniLibraryFileExport = {
    schema: INI_LIBRARY_EXPORT_SCHEMA,
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    snippets: state.snippets,
  };
  return JSON.stringify(payload, null, 2);
}

export function mergeIniLibraryImportJson(text: string, current: IniLibraryState): IniLibraryState | null {
  try {
    const data = JSON.parse(text) as unknown;
    let incoming: IniSnippet[] = [];
    if (Array.isArray(data)) {
      const arr = z.array(iniSnippetSchema).safeParse(data);
      if (!arr.success) return null;
      incoming = arr.data;
    } else if (data && typeof data === "object" && "snippets" in data) {
      const w = data as { snippets: unknown };
      const arr = z.array(iniSnippetSchema).safeParse(w.snippets);
      if (!arr.success) return null;
      incoming = arr.data;
    } else {
      return null;
    }
    const byId = new Map(current.snippets.map((s) => [s.id, s] as const));
    for (const s of incoming) {
      byId.set(s.id, s);
    }
    const merged = [...byId.values()].sort((a, b) => a.title.localeCompare(b.title));
    return { snippets: merged.slice(0, MAX_INI_SNIPPETS) };
  } catch {
    return null;
  }
}

export const INI_CATEGORY_LABELS: Record<IniSnippetCategory, string> = {
  game_user_settings: "GameUserSettings.ini",
  engine: "Engine.ini",
  input: "Input.ini",
  other: "Other",
};
