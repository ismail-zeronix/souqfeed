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
  inline on `master`, all 14 tasks). Theme tokens applied to `globals.css`;
  shared components (`LiveMarketCard`, `StatTile`, `SupplierLogoTile`,
  `SidebarWidget`, `SiteHeader`) built once and reused across both screens;
  mock data lives in `src/modules/{suppliers,offers,brands,categories}/`
  behind the same accessor shapes their real `queries.ts` counterparts will
  eventually have. Full verification pass: `pnpm test`/`lint`/`build` clean,
  plus a real headless-browser pass (desktop + mobile viewports, empty
  states, long-content wrapping) that caught and fixed three bugs the static
  checks missed: a React-hydration mismatch from `Date.now()`-based relative
  timestamps (fixed with `suppressHydrationWarning` on the two affected
  spans — the standard, documented pattern for this exact case), a mobile
  layout overflow from the supplier page's un-scrollable tab bar, and a
  React Compiler lint violation in `CategoryMixDonut` (mutating a variable
  during render). Also fixed in passing: `eslint.config.mjs`'s
  `globalIgnores` didn't account for nested worktrees, so `pnpm lint` was
  scanning `.worktrees/*/.next` build output — added `.worktrees/**`.

## In Progress

- **Phase 1 (DB + auth)** has real, separate progress already underway in
  an unmerged worktree/branch (`phase1-database-auth`), done via
  `subagent-driven-development` on 2026-09-30 — apparently a concurrent
  session, discovered mid-Phase-0.5 and left untouched. Its ledger
  (`.worktrees/phase1-database-auth/.superpowers/sdd/2026-09-30-phase1-database-auth/progress.md`)
  shows Tasks 1–4 complete and reviewed clean (Drizzle client, Better Auth,
  full domain schema with migrations, role guards/middleware, placeholder
  dashboard/admin pages); Task 5 (seed script) was dispatched but has no
  completion report. Whoever resumes it should read that ledger first
  rather than restarting Task 5. This worktree still needs to be merged
  into `master` at some point — expect `current.md` and this phase's
  `docs/superpowers/plans/2026-09-30-phase1-database-auth.md` to need
  reconciling with whatever's landed here in the meantime.

## Next

- Finish and merge Phase 1 from the `phase1-database-auth` worktree (Task 5
  onward), or restart it against `master`'s current state if that worktree
  is abandoned — check with whoever owns that session first.
- Once Phase 1's real DB/auth lands, wire Phase 0.5's mock-data modules to
  real `queries.ts` per the DB-first/seed-fallback pattern in
  `docs/architecture.md`.

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

## Known Issues

- None currently open.

## Important Files

- `project_plan.md` — roadmap and phase list
- `docs/architecture.md`, `docs/data-model.md` — technical foundation
- `docs/broadcast-parsing.md`, `docs/search.md` — core domain logic
- `docs/branding.md`, `docs/theme.md` — visual identity
- `ui-design-ideas/livefeed-home-ui.png`, `ui-design-ideas/supplier-details-view.png`, `ui-design-ideas/wtb-ui-screen.png` — source mockups
- `docs/superpowers/plans/2026-09-30-phase0-repo-scaffold.md` — Phase 0 implementation plan
- `src/lib/validation/env.ts`, `src/lib/logging/logger.ts` — infra modules every later phase builds on
- `docker-compose.yml` — local Postgres + Redis
