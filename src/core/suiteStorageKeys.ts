/** localStorage keys owned by ARK Master Suite (diagnostics / settings). */
export const SUITE_STORAGE_KEYS = [
  "ark-master:cluster-registry:v1",
  "ark-master:cluster-metrics:v1",
  "ark-master:ini-library:v1",
] as const;

export type SuiteStorageKey = (typeof SUITE_STORAGE_KEYS)[number];

export function suiteLocalStoragePresence(): Record<SuiteStorageKey, boolean> {
  if (typeof window === "undefined") {
    return {
      "ark-master:cluster-registry:v1": false,
      "ark-master:cluster-metrics:v1": false,
      "ark-master:ini-library:v1": false,
    };
  }
  const out = {} as Record<SuiteStorageKey, boolean>;
  for (const k of SUITE_STORAGE_KEYS) {
    out[k] = window.localStorage.getItem(k) != null;
  }
  return out;
}
