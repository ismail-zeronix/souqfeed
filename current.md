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

## In Progress

- Final whole-branch review of the Phase 0 work (per
  `superpowers:executing-plans`), before merging `phase0-repo-scaffold` into
  `master`.

## Next

- Merge Phase 0 once the final review is clean.
- Phase 1: full Drizzle schema for every core table in
  `docs/data-model.md`, Better Auth wiring with `ADMIN`/`SUPPLIER` role
  guards, a seed script creating one admin user, and a minimal/unstyled
  login page proving the auth flow end-to-end. Write that plan with
  `writing-plans` once Phase 0 is merged.

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
