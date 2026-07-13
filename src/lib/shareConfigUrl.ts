/**
 * Share links must work with BrowserRouter (http dev / `?config=`) and HashRouter (`file://` builds, `#/?config=`).
 * Query values are passed through URLSearchParams / encodeURIComponent so base64 `+`/`/` are not mangled.
 */

export function readConfigParamFromWindow(): string | null {
  const fromSearch = new URLSearchParams(window.location.search).get("config");
  if (fromSearch) return fromSearch;
  const { hash } = window.location;
  const q = hash.indexOf("?");
  if (q === -1) return null;
  return new URLSearchParams(hash.slice(q)).get("config");
}

export function buildShareUrlWithConfig(encodedPayload: string): string {
  if (window.location.protocol === "file:") {
    const base = window.location.href.split("#")[0];
    const params = new URLSearchParams();
    params.set("config", encodedPayload);
    return `${base}#/?${params.toString()}`;
  }
  const { origin, pathname, search } = window.location;
  const params = new URLSearchParams(search);
  params.set("config", encodedPayload);
  const qs = params.toString();
  return `${origin}${pathname}?${qs}`;
}

/** Remove `config` from search or hash after applying a shared preset (avoid leaking long URLs in the bar). */
export function stripConfigFromUrlAfterLoad(): void {
  const { pathname, search, hash } = window.location;

  const searchParams = new URLSearchParams(search);
  if (searchParams.has("config")) {
    searchParams.delete("config");
    const qs = searchParams.toString();
    window.history.replaceState(null, "", `${pathname}${qs ? `?${qs}` : ""}${hash}`);
    return;
  }

  const qi = hash.indexOf("?");
  if (qi === -1) return;
  const hashParams = new URLSearchParams(hash.slice(qi));
  if (!hashParams.has("config")) return;
  hashParams.delete("config");
  const qs = hashParams.toString();
  const pathPart = hash.slice(0, qi);
  const newHash = qs ? `${pathPart}?${qs}` : pathPart;
  window.history.replaceState(null, "", `${pathname}${search}${newHash}`);
}
