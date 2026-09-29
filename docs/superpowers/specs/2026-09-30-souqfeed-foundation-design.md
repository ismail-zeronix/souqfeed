# SouqFeed — Foundation Design

**Date:** 2026-09-30
**Status:** Approved
**Supersedes:** none (first spec)

## Problem

SouqFeed needs a technical foundation — architecture, data model, and module
boundaries — before any code is written. The product brief (a detailed master
prompt) specifies most of this already; this spec resolves the parts it left
open and adds the two schema pieces its own rules require but don't spell out
as tables.

## Decisions

### Process topology

One codebase, two runtime processes:

- **`web`** — Next.js (App Router, TypeScript) serves all HTTP traffic: public
  pages, the supplier dashboard, the admin panel, and API/server actions.
- **`worker`** — a small entrypoint at `src/worker/index.ts` that boots BullMQ
  workers. It imports the same `src/modules/*/service.ts` functions the web
  process uses — no duplicated business logic, no monorepo tooling.

Rejected alternatives: a pnpm monorepo (`apps/web`, `apps/worker`) adds
workspace tooling with no payoff at this scale; running everything
synchronously with no worker was considered but rejected once the deployment
target was confirmed as a VPS (a persistent worker process is free there,
so there's no reason to give up the queue's retry/observability benefits).

### Data store

- **PostgreSQL + Drizzle ORM** as the system of record.
- **Search:** native Postgres full-text search plus `pg_trgm` for fuzzy
  matching. No Elasticsearch/OpenSearch — out of scope per the product brief,
  and unnecessary at MVP data volumes.
- **Redis** serves two purposes: the BullMQ job queue (broadcast parsing,
  offer-freshness sweeps) and a pub/sub relay — the worker publishes
  `OFFER_CREATED`/`OFFER_UPDATED`/`BROADCAST_PUBLISHED` events, and every
  `web` process instance subscribes and relays to its own connected SSE
  clients. This lets the live feed work correctly even if `web` later runs as
  more than one instance behind Caddy.

### Auth

**Better Auth** with a Drizzle adapter, email/password only (no social login),
sessions stored server-side, and a `role` column (`ADMIN` | `SUPPLIER`) on the
user record. Rejected a hand-rolled session/password implementation — Better
Auth removes an entire class of security-sensitive code (password hashing,
session token generation, cookie handling) we would otherwise own ourselves
for no product benefit.

### Deployment target

**VPS**, not a serverless platform. Docker Compose runs postgres, redis, the
`web` container, and the `worker` container, behind Caddy (TLS termination),
optionally fronted by Cloudflare. This was evaluated against Vercel
specifically: Vercel's serverless functions can't host BullMQ's persistent
worker process or cheaply hold long-lived SSE connections, both of which the
product brief calls for. Choosing a VPS from the start avoids designing around
those constraints (synchronous parsing, polling instead of SSE, a
serverless-specific queue) only to reverse the decision later.

Local development mirrors this with `docker compose up -d` for
postgres+redis, `pnpm dev` for `web`, and `pnpm worker` for the worker
process — no containerized app during development, to keep the inner loop
fast.

### Broadcast processing flow

```
POST broadcast (supplier pastes text)
  → save raw broadcast row (status: PROCESSING)
  → enqueue parse job (BullMQ)
  → worker: RuleBasedBroadcastParser extracts items
  → worker: product matcher assigns matchedProductId/confidence/method per item
  → broadcast status → REVIEW
  → supplier/admin reviews NEEDS_REVIEW items, publishes
  → publish creates/updates Offer rows + Offer Observation rows
  → worker publishes OFFER_CREATED/OFFER_UPDATED to Redis
  → web processes relay to connected SSE clients
  → live feed updates without a page reload
```

## Data Model

Two additions beyond the product brief's literal field lists — both required
to implement rules the brief already states elsewhere, not new scope:

1. **`product_aliases`** — the brief lists "model alias" as matching priority
   #4 (e.g. "U7" / "Ultra 7" / "Core Ultra 7" should resolve to the same
   product) but never names a table for it. Without one, alias matching has
   nowhere to read from.
2. **`offer_observations`** — the brief requires "raw evidence must remain
   immutable" and "maintain price/quantity history," but the `offers` table
   as specified has only single current-value fields. Without an append-only
   observation row per re-broadcast, republishing today's stock list would
   silently overwrite yesterday's price with no trail — directly violating
   the brief's own immutability rule.

Full field-level schema lives in `docs/data-model.md` (kept current as the
schema evolves; this spec captures the *decision*, that doc captures the
*current state*).

## Module / Folder Structure

```
src/
  app/                # routes: /, /search, /suppliers/[slug], /dashboard, /admin
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

Each module owns its schema, validation, and service logic. `web` route
handlers and the `worker` both call into `modules/*/service.ts` — neither
re-implements business logic.

### Parsing & matching

- `BroadcastParser` interface: `parse(input: string): Promise<ParsedBroadcast>`.
  `RuleBasedBroadcastParser` (normalizer → block/line detector → field
  extractors → confidence calculator) is the only implementation built for
  MVP. AI-provider implementations remain a documented extension point on the
  interface, not built now — this is an architectural seam, not the "how do
  we use AI agents to build this software" question, which is a separate,
  deferred discussion.
- The product matcher implements the exact priority order from the product
  brief (part number → SKU → brand+model → alias → brand+family+specs →
  fuzzy trigram → future AI similarity), returning
  `{productId, confidence, method, reasons[]}`. Below the confidence
  threshold, the item is marked `NEEDS_REVIEW` — the matcher never fabricates
  a match.

## Phase 0 / Phase 1 Scope

- **Phase 0:** repo scaffold (Next.js + TS + Tailwind + shadcn/ui, pnpm,
  ESLint/Prettier, `docker-compose.yml` for postgres+redis, Zod env
  validation, the folder skeleton above) plus this documentation set.
- **Phase 1:** the full Drizzle schema for every core table (built together
  now, since foreign keys cross module boundaries and migrations are cheap to
  evolve together before any UI depends on them), Better Auth wired in with
  role guards/middleware, a seed script creating one admin user, and a
  minimal/unstyled login page that proves the auth flow end-to-end. Real UI
  design is a later, separate pass (see the branding/theme spec).

## Consequences

- No Vercel-specific compromises anywhere in the design — the system matches
  the product brief's original target architecture exactly.
- A persistent worker process means BullMQ is "free" from day one; no
  synchronous-parsing fallback path needs to be built or later removed.
- The two schema additions mean Phase 1's migration includes tables the brief
  didn't explicitly ask for by name — `docs/data-model.md` documents why so
  a future reader doesn't mistake them for scope creep.
