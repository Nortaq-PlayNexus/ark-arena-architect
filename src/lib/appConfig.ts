import { z } from "zod";
import { logger } from "@/lib/logger";

const DEFAULT_TITLE = "ARK Master Suite — unified ARK toolkit";

function normalizeOptionalTitle(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim().slice(0, 120);
  return t.length > 0 ? t : undefined;
}

export const appEnvSchema = z.object({
  MODE: z.string().min(1).max(64),
  DEV: z.boolean(),
  PROD: z.boolean(),
  VITE_APP_TITLE: z.unknown().transform(normalizeOptionalTitle),
});

export type AppEnv = z.infer<typeof appEnvSchema>;

export function parseAppEnv(raw: {
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  VITE_APP_TITLE?: unknown;
}): AppEnv {
  const result = appEnvSchema.safeParse(raw);
  if (!result.success) {
    logger.warn("Invalid client environment; using safe defaults.", result.error.flatten());
    return {
      MODE: typeof raw.MODE === "string" && raw.MODE.length > 0 ? raw.MODE.slice(0, 64) : "development",
      DEV: Boolean(raw.DEV),
      PROD: Boolean(raw.PROD),
      VITE_APP_TITLE: normalizeOptionalTitle(raw.VITE_APP_TITLE),
    };
  }
  return result.data;
}

/** Validated Vite `import.meta.env` subset (no secrets; only `VITE_*` is public). */
export const appConfig: AppEnv = parseAppEnv({
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
});

export function getAppDisplayTitle(): string {
  return appConfig.VITE_APP_TITLE ?? DEFAULT_TITLE;
}
