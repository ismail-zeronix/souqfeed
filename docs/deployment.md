# Deployment

> Decision record: `docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md`

## Local development

```bash
docker compose -f docker-compose.yml up -d   # postgres, redis
pnpm dev                # web (Next.js), http://localhost:3000
pnpm worker              # worker (BullMQ), separate terminal -- Phase 1+, not yet implemented
```

`docker-compose.yml` (created in Phase 0) provides only `postgres` and
`redis` for local dev — the app itself runs on the host via `pnpm`, not
containerized, to keep the inner dev loop fast. The `-f docker-compose.yml`
flag is required now that `compose.yaml` (the production stack, below)
also exists in the repo root — Docker Compose prefers `compose.yaml` by
default when both files are present, so a bare `docker compose up -d`
would try to start the production stack instead.

## Full app in Docker, locally

To try a production build on this machine, use `compose.local.yaml`. It needs
no `proxy-net` network, and publishes only the app, on
`http://localhost:3400`, so it won't clash with other projects:

```bash
docker compose -f compose.local.yaml --profile tools build
docker compose -f compose.local.yaml up -d --wait postgres redis
docker compose -f compose.local.yaml --profile tools run --rm migrate
docker compose -f compose.local.yaml --profile tools run --rm migrate pnpm exec tsx src/lib/database/seed.ts
docker compose -f compose.local.yaml --profile tools run --rm migrate pnpm exec tsx src/lib/database/seed-brands.ts
docker compose -f compose.local.yaml --profile tools run --rm migrate pnpm exec tsx src/lib/database/seed-categories.ts
docker compose -f compose.local.yaml up -d --wait app
```

Requires a `.env` copied from `.env.example`, with `BETTER_AUTH_SECRET` and
`ADMIN_PASSWORD` set. Its database settings are overridden. To change the port,
set `SOUQFEED_LOCAL_PORT` in `.env` and rebuild `app`, because the URL is built
into the browser bundle. Stop it with
`docker compose -f compose.local.yaml down`; adding `-v` also deletes its data.

## Production (VPS)

```
Caddy (external, /srv/docker/proxy, TLS termination + reverse proxy)
     ↓  proxy-net (external Docker network)
souqfeed-app:3000  (this repo's `app` service, Next.js standalone build)
     ↓  souqfeed-net (private Docker network)
postgres · redis
```

Caddy already runs separately on the VPS and is not managed by this repo.
It is attached to the external network `proxy-net`; `compose.yaml` attaches
`app` to that same network (plus its own private `souqfeed-net`) so Caddy
can reach it by Docker DNS as `souqfeed-app:3000`. The VPS's actual Caddy
config (not a file in this repo) needs a block like:

```
souqfeed.com {
    reverse_proxy souqfeed-app:3000
}
```

`postgres` and `redis` are attached only to `souqfeed-net` — never
`proxy-net` — and publish no ports to the host. No Kubernetes; Docker
Compose is sufficient at this scale. A `worker` container (BullMQ) sharing
the same image with a different start command is planned but not yet
built — see `pnpm worker` in `CLAUDE.md`.

## Required files

- `docker-compose.yml` — local dev (postgres + redis only; the app runs on
  the host via `pnpm dev`).
- `Dockerfile` — multi-stage build (`deps` → `builder` → `runner`, plus a
  `migrator` stage branched off `deps` for running migrations without
  bundling `drizzle-kit` into the runtime image).
- `compose.yaml` — production stack (`app`, `postgres`, `redis`, plus a
  profile-gated one-off `migrate` service).
- `.dockerignore`
- `.env.example` — every environment variable the app or `compose.yaml`
  reads, with safe placeholder values. Never commit real secrets.

There is no `Caddyfile` in this repo — Caddy is managed separately on the
VPS (see above).

## Running database migrations in production

Migrations are pre-generated ahead of time via `pnpm db:generate` and
committed to `drizzle/` — they are never generated during deployment.
Applying them against production Postgres is a deliberate, explicit step,
never run automatically on container start:

```bash
docker compose build migrate
docker compose --profile tools run --rm migrate
```

This builds and runs the `migrator` Dockerfile stage (full `node_modules`
including `drizzle-kit`, not the slim runtime image), executes
`drizzle-kit migrate` once, and removes the container on exit. The same
target can seed the admin user ad hoc:
`docker compose --profile tools run --rm migrate pnpm exec tsx src/lib/database/seed.ts`.
Don't use `pnpm db:seed` in a container: it reads a `.env` file, which images
deliberately don't contain, so it fails with `node: .env: not found`.

Brands and categories are also seeded explicitly, or the supplier form has none
to offer. Both are safe to re-run and only add what's missing:

```bash
docker compose --profile tools run --rm migrate pnpm exec tsx src/lib/database/seed-brands.ts
docker compose --profile tools run --rm migrate pnpm exec tsx src/lib/database/seed-categories.ts
```

## Environment variables (grows as modules are added)

| Variable              | Purpose                                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | Postgres connection string                                                                                                                                       |
| `REDIS_URL`           | Redis connection string (shared by BullMQ and pub/sub)                                                                                                           |
| `BETTER_AUTH_SECRET`  | Session signing secret                                                                                                                                           |
| `BETTER_AUTH_URL`     | Public app URL, for auth callbacks                                                                                                                               |
| `NEXT_PUBLIC_APP_URL` | Public app URL, for client-side links (e.g. WhatsApp deep links) — inlined into the client bundle at build time, so it must also be passed as a Docker build ARG |
| `ADMIN_EMAIL`         | Email for the seeded admin user (defaults to `admin@souqfeed.local`)                                                                                             |
| `ADMIN_PASSWORD`      | Password for the seeded admin user — **required, no default**. Must not be the `.env.example` placeholder; use a strong, unique value in production              |
| `POSTGRES_USER`       | `compose.yaml`'s `postgres` service credential — must match the user in `DATABASE_URL`                                                                           |
| `POSTGRES_PASSWORD`   | `compose.yaml`'s `postgres` service credential — must match the password in `DATABASE_URL`                                                                       |
| `POSTGRES_DB`         | `compose.yaml`'s `postgres` service credential — must match the database name in `DATABASE_URL`                                                                  |

All environment variables are validated at startup with Zod
(`src/lib/validation`) — the app should fail fast on a missing/malformed
variable rather than fail confusingly later. The three `POSTGRES_*` vars
are the exception: they're consumed only by `compose.yaml` to initialize
the `postgres` container, not by the app's Zod schema.

## Not in scope for MVP

Kubernetes, multi-region deployment, blue/green deploys, CDN-in-front beyond
optional Cloudflare. Revisit only if traffic/reliability requirements
actually demand it.
