/**
 * Client-side logging: verbose traces only in dev; warnings/errors always visible.
 * Never pass secrets or pasted game commands through here in production builds.
 */
const PREFIX = "[ARK Master]";

const dev = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]) => {
    if (dev) console.debug(PREFIX, ...args);
  },
  info: (...args: unknown[]) => {
    if (dev) console.info(PREFIX, ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(PREFIX, ...args);
  },
  error: (...args: unknown[]) => {
    console.error(PREFIX, ...args);
  },
};
