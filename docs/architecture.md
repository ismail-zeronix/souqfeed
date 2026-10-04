# Architecture

> Decision record: `docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md`

## Process topology

One codebase, two runtime processes:

- **`web`** — Next.js (App Router, TypeScript). Serves the public site,
  `/dashboard` (supplier), `/admin`, and all API/server actions.
- **`worker`** (`src/worker/index.ts`) — boots BullMQ workers. Imports
  `src/modules/*/service.ts` directly — the same business logic `web` calls,
  never duplicated.

No monorepo tooling. No microservices. This is a modular monolith: module
boundaries are enforced by folder/import convention, not by network calls.

## Data stores

| Store                    | Role                                                         |
| ------------------------ | ------------------------------------------------------------ |
| PostgreSQL (Drizzle ORM) | System of record for everything.                             |
| Postgres FTS + `pg_trgm` | Search — no Elasticsearch/OpenSearch.                        |
| Redis                    | (1) BullMQ job queue. (2) Pub/sub relay for realtime events. |

Redis's pub/sub role exists specifically so the live feed works correctly
across more than one `web` instance: the worker publishes an event once,
every `web` instance subscribes and relays it to its own connected SSE
clients.

## Auth

Better Auth (Drizzle adapter), email/password, server-side sessions. A
`role` column on the user record is `ADMIN` or `SUPPLIER`. No social login.

## Broadcast processing flow

```
POST broadcast (supplier pastes text)
  → save raw broadcast row, status = PROCESSING
  → enqueue parse job (BullMQ)
  → worker: RuleBasedBroadcastParser → BroadcastItems
  → worker: product matcher assigns matchedProductId/confidence/method
  → broadcast status → REVIEW
  → supplier/admin reviews NEEDS_REVIEW items, clicks Publish
  → publish creates/updates Offer rows + one OfferObservation row each
  → worker publishes OFFER_CREATED / OFFER_UPDATED to Redis
  → every web instance relays the event to its connected SSE clients
  → live feed updates without a page reload
```

See `docs/broadcast-parsing.md` for the parser/matcher internals and
`docs/data-model.md` for the tables involved.

## Deployment topology

**Local development:**

```
docker compose -f docker-compose.yml up -d   # postgres, redis
pnpm dev                  # web (Next.js)
pnpm worker               # worker (BullMQ) -- Phase 1+, not yet implemented
```

`-f docker-compose.yml` is required because `compose.yaml` (below) also
exists in the repo root, and bare `docker compose` commands prefer
`compose.yaml` by default when both are present.

**Production (VPS):**

```
Caddy (external, TLS termination + reverse proxy)
     ↓  proxy-net (external Docker network)
souqfeed-app:3000 (`app` service, compose.yaml)
     ↓  souqfeed-net (private Docker network)
postgres | redis
```

See `docs/deployment.md` for the full compose/Dockerfile design and the
exact migration command. A `worker` container (BullMQ) sharing the same
image with a different start command is planned but not yet built.

Deployment target is a VPS, not a serverless platform — chosen specifically
because a persistent BullMQ worker process and long-lived SSE connections
both need a process that stays alive, which serverless functions don't
provide economically. See the foundation spec for the full comparison
against Vercel.

## Module boundaries

```
src/
  app/                # routes
  modules/
    auth/ suppliers/ brands/ categories/ products/
    broadcasts/ offers/ search/ analytics/ admin/ realtime/
      schema.ts  types.ts  validation.ts  service.ts  queries.ts  actions.ts
  lib/
    database/  auth/  queue/  validation/  logging/
  components/
    ui/  market/  suppliers/  broadcasts/
  worker/
    index.ts
```

Each module owns its schema, validation, and service logic. Route handlers
and the worker call into `modules/*/service.ts` — neither reimplements
business logic. `lib/` holds cross-cutting infrastructure (the Drizzle
client, the Better Auth config, the BullMQ queue definitions, shared Zod
helpers, structured logging) that every module depends on but no module owns.

## Data-access fallback pattern (Phase 1+)

Once a module's real `queries.ts` exists, UI-facing reads follow one rule,
in order: query the database first; if the relevant table exists but is
empty (not yet seeded), seed it from that module's fixture data and query
again; only fall back to in-memory mock data if the database itself is
unreachable. This keeps local/dev environments showing real, persisted
data as soon as Postgres is up, while still degrading gracefully instead
of crashing if the connection fails.

This means the `src/modules/*/mock-data.ts` files added in Phase 0.5
(`docs/superpowers/specs/2026-09-30-souqfeed-ui-foundation-design.md`)
are not deleted once a module's real `queries.ts` lands — they become that
module's seed source, reused by both `pnpm db:seed` and this fallback path.
