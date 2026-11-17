import { describe, expect, it } from "vitest";
import { redisOptionsFromUrl } from "./redis-options";

describe("redisOptionsFromUrl", () => {
  it("reads host and port, defaulting the rest", () => {
    expect(redisOptionsFromUrl("redis://redis:6379")).toMatchObject({
      host: "redis",
      port: 6379,
      db: 0,
      username: undefined,
      password: undefined,
      tls: undefined,
      maxRetriesPerRequest: null,
    });
  });

  it("reads credentials, database, and TLS", () => {
    expect(
      redisOptionsFromUrl("rediss://user:p%40ss@cache.example.com:6380/2"),
    ).toMatchObject({
      host: "cache.example.com",
      port: 6380,
      username: "user",
      password: "p@ss",
      db: 2,
      tls: {},
    });
  });
});
