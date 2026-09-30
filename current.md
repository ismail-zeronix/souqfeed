# Current Status

## Completed

- Product brief reviewed; architecture, data model, module structure, and
  Phase 0/1 scope decided (`docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md`).
- Branding/theme direction decided from `ui-design-ideas/` mockups; brand name
  confirmed as **SouqFeed** (`docs/superpowers/specs/2026-09-30-souqfeed-branding-theme-design.md`).
- Full documentation set materialized: `CLAUDE.md`, `README.md`,
  `project_plan.md`, this file, and `docs/{architecture,data-model,
broadcast-parsing,search,deployment,branding,theme}.md`.
- Git repository initialized.
- **Phase 0 (repo scaffold) complete** — implemented inline per
  `docs/superpowers/plans/2026-09-30-phase0-repo-scaffold.md` in an isolated
  worktree/branch (`phase0-repo-scaffold`), pending final review and merge:
  - Next.js 16 (App Router, TypeScript, Tailwind v4) scaffolded via
    `create-next-app`, merged into the repo without disturbing existing docs.
  - pnpm installed and set as the package manager; `engines` pinned.
  - ESLint (Next's flat config) + Prettier (with Tailwind class sorting)
    wired together via `eslint-config-prettier`.
  - shadcn/ui initialized (`components.json`, `cn()` helper, Button
    primitive) — no `docs/theme.md` colors applied yet, that's a later UI pass.
  - Vitest configured; a fail-fast Zod environment validation module exists
    (`src/lib/validation/env.ts`: `parseEnv`/`getEnv`/`Env`), built TDD,
    6 passing tests — but nothing calls `getEnv()` at boot yet, since no
    code consumes configuration until Phase 1's database client and auth.
  - Structured logging with pino (`src/lib/logging/logger.ts`:
    `createLogger`/`logger`), deliberately decoupled from the env module.
  - `docker-compose.yml` for local Postgres 16 + Redis 7, both verified
    healthy with real connectivity checks (`pg_isready`, `redis-cli ping`).
  - Full loop verified end-to-end: docker up → install → lint → format:check
    → test → build → dev server responds → docker down, with no secrets
    tracked in git.
- **Phase 1 (database + auth) complete** — implemented across 7 tasks per
  `docs/superpowers/plans/2026-09-30-phase1-database-auth.md` in an isolated
  worktree/branch (`phase1-database-auth`), pending final review and merge:
  - Drizzle client wired to `getEnv()`, `drizzle-kit` configured
    (`src/lib/database/client.ts`, `drizzle.config.ts`).
  - Better Auth wired up: email/password, Drizzle adapter, `ADMIN`/`SUPPLIER`
    role enum on the user table (`src/lib/auth/config.ts`,
    `src/modules/auth/schema.ts`).
  - Full domain schema — 12 tables across 7 modules (suppliers, brands,
    categories, products, broadcasts, offers, analytics) — matching
    `docs/data-model.md`, migrated with `drizzle-kit generate`/`migrate`
    (`src/modules/*/schema.ts`, `drizzle/`).
  - Role guards (`authorizeRole`), root `middleware.ts`, and placeholder
    `/dashboard` (SUPPLIER) and `/admin` (ADMIN) pages enforcing both
    layers (`src/modules/auth/guards.ts`).
  - Idempotent seed script creating one ADMIN user, safe to re-run
    (`src/lib/database/seed.ts`).
  - Minimal/unstyled login page (`src/app/login/page.tsx`), verified
    end-to-end: ADMIN → `/admin` 200 w/ cookie, SUPPLIER blocked from
    `/admin` (307), SUPPLIER → `/dashboard` 200.
  - Full loop verified end-to-end from a **genuinely fresh** Docker volume
    (`docker compose down -v` → up → healthy → install → lint →
    format:check → test → build → `db:migrate` → `db:seed` → down) — the
    first time this phase's migrations ran against a truly empty database
    rather than an already-migrated one. No secrets tracked in git.

## In Progress

- Final whole-branch review of the Phase 1 work (per
  `superpowers:executing-plans`), before merging `phase1-database-auth`
  into `master`.

## Next

- Merge Phase 1 once the final review is clean.
- Phase 2: Supplier profiles — CRUD and a public `/suppliers/[slug]` page,
  per `project_plan.md`'s phase table. Write that plan with `writing-plans`
  once Phase 1 is merged.

## Decisions

- VPS deployment (Docker Compose + Caddy), not Vercel — see foundation spec
  for the full reasoning (persistent BullMQ worker + long-lived SSE need a
  non-serverless host).
- No custom `.claude/skills/` for this project — module context lives in
  `docs/*.md` instead (writing-skills guidance: skills are for cross-project
  reusable techniques, not project-specific conventions).
- Two schema additions beyond the literal product brief: `product_aliases`
  and `offer_observations` — both required to implement rules the brief
  already states (alias matching, immutable price/quantity history).
- Phase 0 built inline (native execution) rather than subagent-per-task —
  tasks were mechanical CLI/config work with shallow interfaces, not
  independent logic needing a fresh-reviewer gate per task.
- `parseEnv`'s parameter is typed `Record<string, string | undefined>`, not
  `NodeJS.ProcessEnv` — the installed `@types/node` requires `NODE_ENV` on
  `ProcessEnv`, which is more than the function actually needs.
- Vitest resolves `@/*` path aliases via Vite's native `resolve.tsconfigPaths`
  rather than the `vite-tsconfig-paths` plugin (redundant as of this Vite
  version).
- Better Auth's CLI generates the user table as `user` (singular, exported
  from `src/modules/auth/schema.ts`) with a `text` primary key, not a native
  `uuid` — every FK (`suppliers.userId`) and seed-script reference to
  `user.id` treats it as `text`.
- `pnpm-workspace.yaml` explicitly allows esbuild's install script
  (`allowBuilds: { esbuild: true }`) — discovered during Task 7's full
  from-scratch verification: a plain `pnpm install` fails non-interactively
  (`ERR_PNPM_IGNORED_BUILDS`) until esbuild's postinstall (needed by
  vitest/drizzle-kit/tsx to fetch their native binary) is approved.

## Known Issues

- `docs/data-model.md` is stale relative to what Task 2/3 actually built:
  it calls the auth table `users` (plural) and types `userId`/`user.id` as
  `uuid`; the real table is `user` (singular) with a `text` primary key.
  Needs a doc-reconciliation pass.
- `docs/data-model.md` specifies an index on `categories.parentId` and on
  `suppliers.verified`/`suppliers.active`; Task 3's migration omitted them
  (deferred, not added speculatively). Add if/when query patterns need them.

## Important Files

- `project_plan.md` — roadmap and phase list
- `docs/architecture.md`, `docs/data-model.md` — technical foundation
- `docs/broadcast-parsing.md`, `docs/search.md` — core domain logic
- `docs/branding.md`, `docs/theme.md` — visual identity
- `ui-design-ideas/livefeed-home-ui.png`, `ui-design-ideas/supplier-details-view.png`, `ui-design-ideas/wtb-ui-screen.png` — source mockups
- `docs/superpowers/plans/2026-09-30-phase0-repo-scaffold.md` — Phase 0 implementation plan
- `docs/superpowers/plans/2026-09-30-phase1-database-auth.md` — Phase 1 implementation plan
- `src/lib/validation/env.ts`, `src/lib/logging/logger.ts` — infra modules every later phase builds on
- `docker-compose.yml` — local Postgres + Redis
- `src/lib/database/client.ts`, `src/lib/database/schema.ts`, `drizzle.config.ts` — Drizzle client and schema barrel
- `src/lib/auth/config.ts`, `src/lib/auth/client.ts`, `src/lib/auth/session.ts`, `src/modules/auth/schema.ts` — Better Auth server/client config and user schema
- `src/modules/auth/guards.ts`, `middleware.ts` — role-guard logic (pure, no client import) and route middleware
- `src/modules/{suppliers,brands,categories,products,broadcasts,offers,analytics}/schema.ts` — full domain schema (12 tables)
- `src/lib/database/seed.ts` — idempotent admin-user seed script
- `src/app/login/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/admin/page.tsx` — auth flow + role-gated placeholder pages
