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

## In Progress

- Nothing yet — documentation phase just completed.

## Next

- Run `writing-plans` to produce
  `docs/superpowers/plans/<date>-phase0-repo-scaffold.md` (Next.js/TS/
  Tailwind/shadcn init, pnpm, ESLint/Prettier, `docker-compose.yml`, Zod env
  validation, folder skeleton).
- Decide execution method (subagent-driven vs. native) before implementation
  starts.
- Phase 1 after that: full Drizzle schema, Better Auth wiring, seed script,
  minimal login page.

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

## Known Issues

- None yet — no code exists.

## Important Files

- `project_plan.md` — roadmap and phase list
- `docs/architecture.md`, `docs/data-model.md` — technical foundation
- `docs/broadcast-parsing.md`, `docs/search.md` — core domain logic
- `docs/branding.md`, `docs/theme.md` — visual identity
- `ui-design-ideas/livefeed-home-ui.png`, `ui-design-ideas/supplier-details-view.png`, `ui-design-ideas/wtb-ui-screen.png` — source mockups
