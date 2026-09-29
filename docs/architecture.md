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
docker compose up -d      # postgres, redis
pnpm dev                  # web (Next.js)
pnpm worker               # worker (BullMQ) -- Phase 1+, not yet implemented
```

**Production (VPS):**

```
Cloudflare (optional)
     ↓
Caddy (TLS termination, reverse proxy)
     ↓
Docker Compose: web container | worker container | postgres | redis
```

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
