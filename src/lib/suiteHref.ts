/**
 * HashRouter is used on file:// (Electron); anchors must use `#/path` there.
 * BrowserRouter preview/dev uses normal paths.
 */
export function suiteHomeHref(): string {
  if (typeof window === "undefined") return "/";
  return window.location.protocol === "file:" ? "#/" : "/";
}

/** Path must start with `/` (e.g. `/cluster`). */
export function suiteRouteHref(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return p;
  return window.location.protocol === "file:" ? `#${p}` : p;
}
