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
- **Phase 0.5 (UI foundation) complete** — Live Market homepage and Supplier
  profile page built against static mock data, matching `ui-design-ideas/`'s
  visual language, per
  `docs/superpowers/specs/2026-09-30-souqfeed-ui-foundation-design.md` and
  `docs/superpowers/plans/2026-09-30-souqfeed-ui-foundation.md` (implemented
  inline on `master`, all 14 tasks, concurrently with Phase 1 below). Theme
  tokens applied to `globals.css`; shared components (`LiveMarketCard`,
  `StatTile`, `SupplierLogoTile`, `SidebarWidget`, `SiteHeader`) built once
  and reused across both screens; mock data lives in
  `src/modules/{suppliers,offers,brands,categories}/` behind the same
  accessor shapes their real `queries.ts` counterparts will eventually have.
  Full verification pass: `pnpm test`/`lint`/`build` clean, plus a real
  headless-browser pass (desktop + mobile viewports, empty states,
  long-content wrapping) that caught and fixed three bugs the static checks
  missed: a React-hydration mismatch from `Date.now()`-based relative
  timestamps (fixed with `suppressHydrationWarning` on the two affected
  spans — the standard, documented pattern for this exact case), a mobile
  layout overflow from the supplier page's un-scrollable tab bar, and a
  React Compiler lint violation in `CategoryMixDonut` (mutating a variable
  during render). Also fixed in passing: `eslint.config.mjs`'s
  `globalIgnores` didn't account for nested worktrees, so `pnpm lint` was
  scanning `.worktrees/*/.next` build output — added `.worktrees/**`.
- **Phase 1 (database + auth) complete** — implemented across 7 tasks per
  `docs/superpowers/plans/2026-09-30-phase1-database-auth.md` via
  `subagent-driven-development` in an isolated worktree/branch
  (`phase1-database-auth`), concurrently with Phase 0.5 above, then merged
  into `master` after a final whole-branch review (1 Critical + 4 Important
  findings, all fixed and re-reviewed clean):
  - Drizzle client wired to `getEnv()`, `drizzle-kit` configured
    (`src/lib/database/client.ts`, `drizzle.config.ts`).
  - Better Auth wired up: email/password, Drizzle adapter, `ADMIN`/`SUPPLIER`
    role enum on the user table (`src/lib/auth/config.ts`,
    `src/modules/auth/schema.ts`). Public self-signup is open (see Decisions).
  - Full domain schema — 12 tables across 7 modules (suppliers, brands,
    categories, products, broadcasts, offers, analytics) — matching
    `docs/data-model.md`, migrated with `drizzle-kit generate`/`migrate`
    (`src/modules/*/schema.ts`, `drizzle/`).
  - Two-layer role guards: `proxy.ts` (root, Next.js 16's renamed middleware
    convention) does a cheap session-cookie-presence redirect; `/dashboard`
    (SUPPLIER) and `/admin` (ADMIN) do the real server-side
    `getCurrentSession()` + `authorizeRole()` check (`src/modules/auth/guards.ts`),
    redirecting an authenticated-but-wrong-role user to their own home
    rather than bouncing them to `/login`.
  - Idempotent, self-healing seed script creating one ADMIN user — repairs
    the role if a prior run's signup succeeded but promotion didn't
    (`src/lib/database/seed.ts`). `ADMIN_PASSWORD` has no default and is
    rejected if left at its `.env.example` placeholder, mirroring
    `BETTER_AUTH_SECRET`'s existing safeguard.
  - Minimal/unstyled login page (`src/app/login/page.tsx`), verified
    end-to-end: ADMIN → `/admin` 200 w/ cookie, SUPPLIER blocked from
    `/admin` (redirected to `/dashboard`), SUPPLIER → `/dashboard` 200.
  - Full loop verified end-to-end from a **genuinely fresh** Docker volume
    (`docker compose down -v` → up → healthy → install → lint →
    format:check → test → build → `db:migrate` → `db:seed` → down) — the
    first time this phase's migrations ran against a truly empty database
    rather than an already-migrated one. No secrets tracked in git.

## In Progress

- Nothing currently in flight — Phase 0, 0.5, and 1 are all merged to
  `master`.

## Next

- Wire Phase 0.5's mock-data modules (`src/modules/{suppliers,offers,brands,
  categories}/`) to real `queries.ts` against the now-real database, per the
  DB-first/seed-fallback pattern in `docs/architecture.md` — Phase 0.5's UI
  already assumes this shape, so this is largely plumbing, not redesign.
- Phase 2: the remaining write-side work — supplier CRUD (self-service
  profile editing from `/dashboard`) and admin verification — per
  `project_plan.md`'s phase table. Phase 0.5 already built the public
  `/suppliers/[slug]` read side against mock data; Phase 2 is what makes it
  real and adds the parts Phase 0.5 didn't (editing, verification).

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
- Phase 0.5 (UI foundation) added ahead of Phase 1 — builds the Live Market
  homepage and Supplier profile UI against static mock data first; see
  `docs/superpowers/specs/2026-09-30-souqfeed-ui-foundation-design.md`.
- Data-access fallback pattern for every module's future `queries.ts`:
  query the DB first, seed it from that module's mock-data fixtures if
  empty, fall back to in-memory mock data only if the DB is unreachable —
  see `docs/architecture.md`. Phase 0.5 itself stays mock-only; this
  pattern applies once each module's real `queries.ts` is built.
- Better Auth's CLI generates the user table as `user` (singular, exported
  from `src/modules/auth/schema.ts`) with a `text` primary key, not a native
  `uuid` — every FK (`suppliers.userId`) and seed-script reference to
  `user.id` treats it as `text`.
- `pnpm-workspace.yaml` explicitly allows esbuild's install script
  (`allowBuilds: { esbuild: true }`) — discovered during Task 7's full
  from-scratch verification: a plain `pnpm install` fails non-interactively
  (`ERR_PNPM_IGNORED_BUILDS`) until esbuild's postinstall (needed by
  vitest/drizzle-kit/tsx to fetch their native binary) is approved.
- Public self-signup via email/password is intentionally left open in
  Phase 1 — any signup gets SUPPLIER role with `/dashboard` access. No
  admin-approval gate exists yet. Phase 2 (Supplier Profiles) is expected
  to add real verification workflow against the existing
  `suppliers.verified` column before this matters in practice.
- `proxy.ts` replaces `middleware.ts` — Next.js 16 deprecated and renamed
  the file convention; same logic and `matcher`, new name only.

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
- `docs/superpowers/plans/2026-09-30-souqfeed-ui-foundation.md` — Phase 0.5 implementation plan
- `docs/superpowers/plans/2026-09-30-phase1-database-auth.md` — Phase 1 implementation plan
- `src/lib/validation/env.ts`, `src/lib/logging/logger.ts` — infra modules every later phase builds on
- `docker-compose.yml` — local Postgres + Redis
- `src/components/{market,suppliers,layout,ui}/` — shared UI components from Phase 0.5 (`LiveMarketCard`, `StatTile`, `SupplierLogoTile`, `SidebarWidget`, `SiteHeader`, etc.)
- `src/lib/database/client.ts`, `src/lib/database/schema.ts`, `drizzle.config.ts` — Drizzle client and schema barrel
- `src/lib/auth/config.ts`, `src/lib/auth/client.ts`, `src/lib/auth/session.ts`, `src/modules/auth/schema.ts` — Better Auth server/client config and user schema
- `src/modules/auth/guards.ts`, `proxy.ts` — role-guard logic (pure, no client import) and route proxy (formerly `middleware.ts`)
- `src/modules/{suppliers,brands,categories,products,broadcasts,offers,analytics}/schema.ts` — full domain schema (12 tables); the same `suppliers`/`offers`/`brands`/`categories` modules also hold Phase 0.5's mock-data fixtures pending the `queries.ts` wiring in Next
- `src/lib/database/seed.ts` — idempotent, self-healing admin-user seed script
- `src/app/login/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/admin/page.tsx` — auth flow + role-gated placeholder pages
- `src/app/page.tsx`, `src/app/suppliers/[slug]/page.tsx` — Phase 0.5's Live Market homepage and Supplier profile page (mock data)
