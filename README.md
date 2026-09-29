# SouqFeed

A B2B supplier-discovery and live-stock-intelligence platform for the Dubai
IT wholesale market (starting with Bur Dubai). Suppliers paste their
existing WhatsApp stock broadcasts; SouqFeed parses them into structured,
searchable offers. Buyers search the market instead of scrolling hundreds of
WhatsApp messages, then contact the supplier directly via WhatsApp.

> **Status:** documentation and architecture phase complete, no code yet.
> See `current.md` for exactly what's done and what's next.

## What this is not

Not ecommerce, not a checkout/payment platform, not an ERP/CRM. WhatsApp
remains the communication channel — SouqFeed is the structured discovery
layer on top of it. See `project_plan.md` for the full scope boundary.

## Architecture

One codebase, two processes: a Next.js `web` app and a small BullMQ `worker`
that shares the same business-logic modules. PostgreSQL is the system of
record; Redis backs the job queue and the realtime pub/sub relay. Full
details in [`docs/architecture.md`](docs/architecture.md).

## Tech stack

Next.js (App Router) + TypeScript, Tailwind CSS + shadcn/ui, PostgreSQL +
Drizzle ORM, Better Auth, Redis + BullMQ, Server-Sent Events, Docker /
Docker Compose, Caddy, pnpm.

## Local development

```bash
docker compose up -d   # starts postgres + redis
pnpm install
pnpm dev                # starts the web app at http://localhost:3000
```

`pnpm db:migrate`, `pnpm db:seed`, and `pnpm worker` are Phase 1+ commands —
their targets (the Drizzle schema, the seed script, the worker entrypoint)
don't exist yet. This section will grow as each phase lands.

## Environment variables

Copy `.env.example` to `.env` and fill in real values. A fail-fast Zod
validator exists at `src/lib/validation/env.ts` (`parseEnv`/`getEnv`), but
nothing calls it at app boot yet — no code reads configuration yet, since
the database client and auth are Phase 1 work. Wiring `getEnv()` into boot
is part of that phase. See [`docs/deployment.md`](docs/deployment.md) for
the full variable list.

## Database & migrations

Schema is defined with Drizzle ORM; see [`docs/data-model.md`](docs/data-model.md)
for the full table/field/index reference. The schema itself and the
`pnpm db:migrate`/`pnpm db:seed` commands are Phase 1 work — not yet built.

## Workers

Background processing (broadcast parsing, offer-freshness sweeps) will run
in a separate `pnpm worker` process using BullMQ against the same Redis
instance as the web app, once that phase of work begins. See
[`docs/architecture.md`](docs/architecture.md) for the intended processing
flow.

## Production deployment

Docker Compose on a VPS, behind Caddy for TLS, optionally behind Cloudflare.
See [`docs/deployment.md`](docs/deployment.md).

## Current MVP functionality

Tracked phase-by-phase in [`project_plan.md`](project_plan.md); current
progress in [`current.md`](current.md).

## Documentation

| Topic                        | Doc                                                      |
| ---------------------------- | -------------------------------------------------------- |
| Architecture                 | [`docs/architecture.md`](docs/architecture.md)           |
| Data model                   | [`docs/data-model.md`](docs/data-model.md)               |
| Broadcast parsing & matching | [`docs/broadcast-parsing.md`](docs/broadcast-parsing.md) |
| Search                       | [`docs/search.md`](docs/search.md)                       |
| Branding                     | [`docs/branding.md`](docs/branding.md)                   |
| Theme / design tokens        | [`docs/theme.md`](docs/theme.md)                         |
| Deployment                   | [`docs/deployment.md`](docs/deployment.md)               |
| Design decision history      | `docs/superpowers/specs/`                                |
| Implementation plans         | `docs/superpowers/plans/`                                |

## Future roadmap

WhatsApp Cloud API / email / Telegram ingestion, WTB (Want To Buy) requests,
automatic buyer/supplier matching, supplier analytics, saved searches,
alerts, price-trend intelligence, a public API, a mobile app, multi-country
markets, and AI-assisted parsing providers (the `BroadcastParser` interface
already supports adding these). None of this is blocked by the current
architecture — see `project_plan.md` for the full list.
