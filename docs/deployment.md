# Deployment

> Decision record: `docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md`

## Local development

```bash
docker compose up -d   # postgres, redis
pnpm dev                # web (Next.js), http://localhost:3000
pnpm worker              # worker (BullMQ), separate terminal -- Phase 1+, not yet implemented
```

`docker-compose.yml` (created in Phase 0) provides only `postgres` and
`redis` for local dev — the app itself runs on the host via `pnpm`, not
containerized, to keep the inner dev loop fast.

## Production (VPS)

```
Cloudflare (optional — DNS/CDN/DDoS)
     ↓
Caddy (TLS termination, reverse proxy)
     ↓
Docker Compose:
  - web container (Next.js, built for production)
  - worker container (same image, different entrypoint/command)
  - postgres
  - redis
```

Both `web` and `worker` build from the same Docker image — they're the same
codebase, differing only in start command (`pnpm start` vs `pnpm worker`).
No Kubernetes; Docker Compose is sufficient at this scale.

## Required files (created during Phase 0/14)

- `docker-compose.yml` — local dev (postgres + redis).
- `docker-compose.prod.yml` — production overlay (adds `web`, `worker`,
  resource limits, restart policies).
- `Caddyfile` — reverse proxy + automatic TLS.
- `.env.example` — every environment variable the app reads, with safe
  placeholder values. Never commit real secrets.

## Environment variables (grows as modules are added)

| Variable              | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`        | Postgres connection string                                       |
| `REDIS_URL`           | Redis connection string (shared by BullMQ and pub/sub)           |
| `BETTER_AUTH_SECRET`  | Session signing secret                                           |
| `BETTER_AUTH_URL`     | Public app URL, for auth callbacks                               |
| `NEXT_PUBLIC_APP_URL` | Public app URL, for client-side links (e.g. WhatsApp deep links) |

All environment variables are validated at startup with Zod
(`src/lib/validation`) — the app should fail fast on a missing/malformed
variable rather than fail confusingly later.

## Not in scope for MVP

Kubernetes, multi-region deployment, blue/green deploys, CDN-in-front beyond
optional Cloudflare. Revisit only if traffic/reliability requirements
actually demand it.
