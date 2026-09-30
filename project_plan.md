# SouqFeed — Project Plan

## What this is

A B2B supplier-discovery and live-stock-intelligence platform for the Dubai
IT wholesale market (starting with Bur Dubai). Suppliers paste their existing
WhatsApp stock broadcasts; the platform parses them into structured,
searchable offers. Buyers search the market instead of scrolling hundreds of
WhatsApp messages, then contact the supplier via WhatsApp — the platform is
the discovery layer, not a replacement for WhatsApp itself.

## What this is not (MVP)

No checkout, cart, payments, escrow, shipping, invoicing, accounting, ERP,
CRM, buyer reviews/star ratings, complex KYC, mobile app, microservices,
Kubernetes, Elasticsearch, or ML beyond deterministic rule-based parsing.

## Core workflow

```
Supplier → creates profile → pastes broadcast → raw broadcast stored
  → parsed into items → matched to canonical products → reviewed
  → published → becomes live offers
Buyer → searches / browses live feed → finds suppliers → contacts via WhatsApp
```

## Locked technical decisions

Full reasoning: `docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md`

- Single codebase, two processes: `web` (Next.js) + `worker` (BullMQ),
  importing shared `src/modules/*/service.ts` logic.
- PostgreSQL + Drizzle ORM; search via native FTS + `pg_trgm`, no Elasticsearch.
- Redis: BullMQ queue + pub/sub relay for realtime SSE.
- Better Auth (Drizzle adapter), email/password, `ADMIN`/`SUPPLIER` roles.
- Deployment: VPS via Docker Compose + Caddy, not serverless.
- Brand name: **SouqFeed**. Branding/theme: `docs/branding.md`, `docs/theme.md`.

## Module map

`auth`, `suppliers`, `brands`, `categories`, `products`, `broadcasts`,
`offers`, `search`, `analytics`, `admin`, `realtime` — see
`docs/architecture.md` for the folder structure and boundaries.

## Phases

Finish and verify each phase before starting the next.

| Phase | Scope                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------- |
| 0     | Repo scaffold (Next.js/TS/Tailwind/shadcn, pnpm, Docker Compose, env validation) + this documentation set |
| 0.5   | UI foundation: theme tokens, shared components, Live Market homepage + Supplier profile page against static mock data (`docs/superpowers/specs/2026-09-30-souqfeed-ui-foundation-design.md`) |
| 1     | Database schema (full) + Better Auth + role guards + seed admin + minimal login                           |
| 2     | Supplier profiles (CRUD, public `/suppliers/[slug]` page)                                                 |
| 3     | Brands + Categories + Products (admin CRUD, canonical product model)                                      |
| 4     | Broadcast submission (paste, store raw, status lifecycle)                                                 |
| 5     | Broadcast parser (`RuleBasedBroadcastParser`, deterministic extraction)                                   |
| 6     | Review + publishing (NEEDS_REVIEW UI, product matcher, publish flow)                                      |
| 7     | Offers (creation from published items, offer observations/history)                                        |
| 8     | Public live feed (`/`, live market cards)                                                                 |
| 9     | Search (`/search`, FTS + trigram, filters, grouping by product)                                           |
| 10    | Supplier public profiles (broadcast history, active offers)                                               |
| 11    | Realtime (Redis pub/sub → SSE → live feed updates)                                                        |
| 12    | Analytics (`analytics_events`, profile views, WhatsApp clicks)                                            |
| 13    | Admin panel (verification, review queue, brand/category/product management)                               |
| 14    | Deployment (Docker Compose prod, Caddy, VPS)                                                              |

Current phase: see `current.md`.

## Success criteria

The MVP is functional when all 21 criteria in the original product brief are
met — summarized: admin and supplier can log in; supplier can create a
profile, paste a broadcast, review parsed items, and publish; published
items become searchable offers; the homepage shows a live feed that updates
without a full reload; buyers can search/filter and reach a supplier via
WhatsApp; admin can manage suppliers/products/categories; the whole stack
runs via Docker/Postgres/Redis and deploys to a VPS.

## Deferred to later (not blocked by current architecture)

WhatsApp Cloud API / email / Telegram ingestion, WTB requests, automatic
buyer/supplier matching, supplier subscriptions & analytics, saved searches,
alerts, price-trend intelligence, public API, mobile app, multi-country
markets, organization accounts, AI procurement agents, AI-assisted parsing
providers (the `BroadcastParser` interface already supports adding these).
