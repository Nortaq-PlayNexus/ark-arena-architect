import { logger } from "@/lib/logger";

/**
 * Registers the app shell service worker in production (http/https only).
 * Not used under file:// (Electron) or during Vite dev (avoids stale HMR).
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (typeof window === "undefined") return;
  if (window.location.protocol === "file:") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    const swUrl = new URL("sw.js", window.location.href).href;
    void navigator.serviceWorker
      .register(swUrl)
      .then(() => {
        logger.debug("Service worker registered:", swUrl);
      })
      .catch((err: unknown) => {
        logger.warn("Service worker registration skipped or failed.", err);
      });
  });
}
