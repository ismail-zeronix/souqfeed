import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const validEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  REDIS_URL: "redis://localhost:6379",
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  ADMIN_PASSWORD: "a-strong-unique-admin-password",
};

describe("parseEnv", () => {
  it("parses a valid environment and defaults LOG_LEVEL", () => {
    const env = parseEnv(validEnv);
    expect(env.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(env.LOG_LEVEL).toBe("info");
  });

  it("throws a descriptive error when DATABASE_URL is missing", () => {
    expect(() => parseEnv({ ...validEnv, DATABASE_URL: undefined })).toThrow(
      /DATABASE_URL/,
    );
  });

  it("throws when BETTER_AUTH_SECRET is too short", () => {
    expect(() =>
      parseEnv({ ...validEnv, BETTER_AUTH_SECRET: "short" }),
    ).toThrow(/BETTER_AUTH_SECRET/);
  });

  it("throws when DATABASE_URL is not a postgres connection string", () => {
    expect(() =>
      parseEnv({ ...validEnv, DATABASE_URL: "https://example.com" }),
    ).toThrow(/DATABASE_URL/);
  });

  it("throws when REDIS_URL is not a redis connection string", () => {
    expect(() =>
      parseEnv({ ...validEnv, REDIS_URL: "postgresql://localhost:5432/db" }),
    ).toThrow(/REDIS_URL/);
  });

  it("throws when BETTER_AUTH_SECRET is still the .env.example placeholder", () => {
    expect(() =>
      parseEnv({
        ...validEnv,
        BETTER_AUTH_SECRET: "replace-with-a-random-32-byte-secret",
      }),
    ).toThrow(/BETTER_AUTH_SECRET/);
  });

  it("defaults ADMIN_EMAIL when not set", () => {
    const env = parseEnv(validEnv);
    expect(env.ADMIN_EMAIL).toBe("admin@souqfeed.local");
  });

  it("throws a descriptive error when ADMIN_PASSWORD is missing", () => {
    expect(() => parseEnv({ ...validEnv, ADMIN_PASSWORD: undefined })).toThrow(
      /ADMIN_PASSWORD/,
    );
  });

  it("throws when ADMIN_PASSWORD is too short", () => {
    expect(() => parseEnv({ ...validEnv, ADMIN_PASSWORD: "short" })).toThrow(
      /ADMIN_PASSWORD/,
    );
  });

  it("throws when ADMIN_PASSWORD is still the .env.example placeholder", () => {
    expect(() =>
      parseEnv({ ...validEnv, ADMIN_PASSWORD: "changeme-admin-1234" }),
    ).toThrow(/ADMIN_PASSWORD/);
  });
});
