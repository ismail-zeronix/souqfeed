import { z } from "zod";

const PLACEHOLDER_SECRET = "replace-with-a-random-32-byte-secret";
const PLACEHOLDER_ADMIN_PASSWORD = "changeme-admin-1234";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((v) => v.startsWith("postgres"), {
      message: "must be a postgres:// or postgresql:// connection string",
    }),
  REDIS_URL: z
    .string()
    .url()
    .refine((v) => v.startsWith("redis"), {
      message: "must be a redis:// connection string",
    }),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32)
    .refine((v) => v !== PLACEHOLDER_SECRET, {
      message: "must not be the placeholder value from .env.example",
    }),
  BETTER_AUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  ADMIN_EMAIL: z.string().email().default("admin@souqfeed.local"),
  ADMIN_PASSWORD: z
    .string()
    .min(8)
    .refine((v) => v !== PLACEHOLDER_ADMIN_PASSWORD, {
      message: "must not be the placeholder value from .env.example",
    }),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(
  source: Record<string, string | undefined> = process.env,
): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

// Lazy singleton: importing this module must never itself trigger parsing
// (a test importing `parseEnv` would otherwise parse the real process.env
// as a side effect). Real consumption happens through getEnv().
let cachedEnv: Env | undefined;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = parseEnv(process.env);
  }
  return cachedEnv;
}
