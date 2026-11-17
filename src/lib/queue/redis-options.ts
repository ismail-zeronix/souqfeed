/** ioredis connection options from a redis:// or rediss:// URL. */
export function redisOptionsFromUrl(url: string) {
  const parsed = new URL(url);
  const db = Number(parsed.pathname.slice(1) || "0");
  return {
    host: parsed.hostname,
    port: Number(parsed.port || "6379"),
    username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    db: Number.isInteger(db) ? db : 0,
    tls: parsed.protocol === "rediss:" ? {} : undefined,
    // BullMQ requires this for blocking commands; see its connection docs.
    maxRetriesPerRequest: null,
  };
}
