# SouqFeed

B2B supplier-discovery and live-stock-intelligence platform for the Dubai IT
wholesale market. Turns suppliers' WhatsApp stock broadcasts into structured,
searchable offers. Not ecommerce, not an ERP/CRM — read `project_plan.md`
before assuming a feature belongs here.

## Stack

Next.js (App Router) + TypeScript, Tailwind + shadcn/ui, PostgreSQL + Drizzle
ORM, Better Auth, Redis + BullMQ, Server-Sent Events, Docker Compose, pnpm.

## Commands

```
pnpm dev              # web app
pnpm build            # production build
pnpm lint             # ESLint
pnpm format           # Prettier --write
pnpm format:check     # Prettier --check
pnpm test             # Vitest
pnpm db:generate      # generate Drizzle migrations from schema changes
pnpm db:migrate       # apply pending Drizzle migrations
pnpm db:seed          # seed the admin user
docker compose -f docker-compose.yml up -d  # postgres + redis, for local dev
```

The `-f docker-compose.yml` is required: `compose.yaml` (the production stack)
now also exists in the repo root, and bare `docker compose` commands prefer
`compose.yaml` by default when both are present.

Not yet implemented (Phase 1+): `pnpm worker` (BullMQ worker entrypoint). Add
the script to `package.json` in the phase that creates its target — don't
add the command here before it exists.

In production, run `db:migrate`/`db:seed` via the one-off `migrate` Compose
target — never automatically on container start. See `docs/deployment.md`
for the exact command.

## Non-negotiable rules

1. Inspect before changing — don't overwrite working architecture.
2. Write a short plan before each major module.
3. Work in the phase order in `project_plan.md`; finish and verify one phase
   before starting the next.
4. No giant files — split by responsibility.
5. No speculative abstractions — abstract only where multiple
   implementations are already known (parser, AI provider, search, storage).
6. No new library without a real current problem it solves.
7. Prefer database constraints over application-level assumptions.
8. Raw broadcast text is immutable — never mutate or overwrite it.
9. Parsed/matched values are not truth — always traceable back to source.
10. Never invent a specification. Unmatched/unextracted fields stay `null`.

## Where to look

| Need                                               | File                          |
| -------------------------------------------------- | ----------------------------- |
| Roadmap, phases, locked stack decisions            | `project_plan.md`             |
| What's done / in progress / next                   | `current.md`                  |
| System architecture, process topology              | `docs/architecture.md`        |
| Full schema, tables, indexes                       | `docs/data-model.md`          |
| Broadcast parsing pipeline, matching rules         | `docs/broadcast-parsing.md`   |
| Search ranking, filters                            | `docs/search.md`              |
| Brand identity, voice                              | `docs/branding.md`            |
| Design tokens, visual language                     | `docs/theme.md`               |
| SEO strategy, keyword research, technical baseline | `docs/seo.md`                 |
| Docker/Caddy/VPS setup                             | `docs/deployment.md`          |
| Why a decision was made                            | `docs/superpowers/specs/*.md` |
| Phase-by-phase implementation checklists           | `docs/superpowers/plans/*.md` |

No project-specific Claude Code Skills exist under `.claude/skills/` — module
context lives in the docs above instead (see the foundation spec for why).

@AGENTS.md
