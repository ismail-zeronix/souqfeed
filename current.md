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

- **Production Docker deployment prep complete** — normally Phase 14, done
  ahead of sequence at explicit request; does not block Phase 2 next.
  `next.config.ts` (`output: "standalone"`), multi-stage `Dockerfile`
  (`deps` → `builder` → `runner`, plus a `migrator` stage branched off
  `deps` so `drizzle-kit` never ships in the runtime image), `.dockerignore`,
  and `compose.yaml` (`app`/`postgres`/`redis` + a profile-gated one-off
  `migrate` service) for the `proxy-net`/`souqfeed-net` + external-Caddy
  VPS topology. `src/app/api/health/route.ts` added; `src/lib/auth/client.ts`
  gets a fail-fast guard on `NEXT_PUBLIC_APP_URL`. Better Auth's
  secure-cookie/`trustedOrigins` defaults verified (from `better-auth`'s own
  source) to already derive correctly from `BETTER_AUTH_URL`'s `https://`
  scheme — no config change needed there. Full stack smoke-tested locally
  with real Docker networking (build → migrate → up → healthcheck → curl
  `souqfeed-app:3000/api/health` from a `proxy-net` container → confirmed
  `postgres`/`redis` unreachable from `proxy-net`). See `docs/deployment.md`
  for the exact migration command and env vars.

- **Home page redesign + SEO baseline complete** — done ahead of sequence
  at explicit request (neither is in `project_plan.md`'s phase roadmap;
  same out-of-sequence precedent as the earlier production-Docker-deployment
  work above); does not block Phase 2 next. Header de-stickied site-wide
  (was `sticky`/transparent-over-hero via `IntersectionObserver`, now a
  normal static, always-solid header); fixed a real `SelectTrigger`
  height bug in both `home-hero.tsx` and `market-hero.tsx` (a bare `h-11`
  override was losing to the base component's `data-[size=default]:h-8`
  on specificity); `CategoryShowcase` moved directly below the hero,
  redesigned as a horizontally-scrollable, card-chrome-free row using
  `@tabler/icons-react` for category icons (added as a new dependency,
  scoped to that one file — `lucide-react` is untouched everywhere else);
  two new sections (`HowItWorks`, `SampleFeedback` — the latter explicitly
  labeled "Illustrative — not real accounts," since SouqFeed has no real
  suppliers/buyers onboarded yet); a `LocationCategoryLinks` band above the
  footer with separate (not paired) category and area links, the area
  labels aliased to real mock location strings after confirming via web
  search that "Al Raffa Street" and "Al Ain Centre/Computer Plaza" both
  sit inside the existing `"Al Fahidi"`/`"Bur Dubai"` mock data, not a
  separate market. `/feed` now reads `searchParams` (`category`/`location`/
  `q`) into `TradingFloorView`'s initial filter state, so these links (and
  the pre-existing category tiles) actually filter instead of being
  decorative. SEO baseline added: `public/llms.txt`, `src/app/robots.ts`,
  `src/app/sitemap.ts` (deliberately excludes `/suppliers/[slug]` — mock
  company data), OpenGraph/Twitter/`metadataBase` metadata and
  Organization+WebSite JSON-LD in `layout.tsx` (no `LocalBusiness` schema
  or logo — no real address/asset to back them), `noindex` on
  `/login`/`/dashboard`/`/admin`. Full keyword/competitive research, a
  current-state audit, and a future-pages roadmap written up in
  `docs/seo.md`.

- **Phase 2 (supplier profiles) complete** — implemented on branch
  `phase2-implementation`, with the deviations listed at the top of
  `docs/superpowers/plans/2026-10-04-souqfeed-phase2-supplier-profiles.md`.
  Suppliers create and edit their own profile from `/dashboard`, admins verify
  and activate suppliers from `/admin`, and `/suppliers/[slug]` reads real rows.
  Verified end to end in a real browser from an empty database.
- **Role escalation fixed.** `role` was `input: true` in Better Auth, so anyone
  could sign up as `ADMIN` or promote themselves through `/update-user` —
  reproduced locally, then closed (`src/lib/auth/config.ts`,
  `resolveSignupRole` in `src/modules/auth/guards.ts`). No schema change.
- **Drizzle snapshot repaired.** `drizzle/meta/0002_snapshot.json` added;
  `db:generate` now reports no changes. No new migration.

- **Phase 3 (brands, categories, products) complete** — on the same branch, per
  `docs/superpowers/plans/2026-11-07-souqfeed-phase3-catalog.md`. Admin tabs at
  `/admin`; brand and category management; product search, filters, pagination,
  specifications, and aliases. Migration `0003` adds the catalog's unique rules
  and repairs the Buraqa seeder's data. Brands and categories no longer seed on
  read. Verified in a browser on a production build, with non-admin replays of
  admin actions, and with the migration run against old-format rows.
- `compose.local.yaml` runs the full app in Docker on `http://localhost:3400`
  (set `SOUQFEED_LOCAL_PORT`, e.g. `3410`, when another project holds 3400).
- Phases 2–3 committed (`05fee5c`).

- **Admin portal separation + super admin role complete** — done ahead of
  Phase 4 at the owner's request, per
  `docs/superpowers/plans/2026-11-17-souqfeed-admin-portal.md`. Staff sign in
  at `/admin/login`, buyers and suppliers at `/login`; a Better Auth hook
  refuses each account at the other login with the normal invalid-credentials
  error, and Better Auth's rate limiting still applies to both. New
  `SUPER_ADMIN` role (migration `0004`); the seeded account is now
  `SUPER_ADMIN`. Admin pages moved into `src/app/admin/(panel)/` (same URLs)
  with their own top bar instead of the public header. Also fixed: `proxy.ts`
  sat in the repo root, which Next.js ignores in a `src/` project, so it never
  ran; it is now `src/proxy.ts`. Verified in Docker: each portal accepts only
  its own accounts, wrong-portal and unknown-email errors are identical,
  role redirects and anonymous 307s all correct.

- **Admin UI redesign complete** — shadcn Sidebar layout (collapsible icon
  rail on desktop, drawer on phones, collapse state remembered in the
  `sidebar_state` cookie), breadcrumb header, user menu with sign-out, and
  shared `AdminPageHeader`/`AdminEmptyState` + shadcn `Card` on every page.
  `/admin` is now an overview dashboard with real counts (`src/modules/admin/queries.ts`);
  the supplier list moved to `/admin/suppliers`. Sidebar tokens use the brand
  purple. shadcn's generated `use-mobile` hook was rewritten with
  `useSyncExternalStore` (the generated one failed the React Compiler lint),
  and `SidebarInset` renders a `div` because the root layout already has
  `<main>`. Checked in a headless browser at desktop and phone widths: no
  console errors, no horizontal overflow.

- **Phase 4 (broadcast submission) complete** — per
  `docs/superpowers/plans/2026-11-17-souqfeed-phase4-broadcast-submission.md`.
  Suppliers post broadcasts at `/dashboard/broadcasts/new`; text is stored
  exactly as pasted with status `PROCESSING`. History and detail pages for
  suppliers (scoped to their own broadcasts), `/admin/broadcasts` with status
  filters for staff. Lifecycle rules in `src/modules/broadcasts/status.ts`;
  `transitionBroadcastStatus` is ready for the Phase 5 worker. Migration
  `0005` adds triggers that make `broadcasts.raw_text` and
  `broadcast_items.raw_line`/`raw_block` immutable in the database. Guards:
  30 broadcasts per supplier per hour; the same text within 2 minutes reuses
  the existing broadcast. Verified in Docker with a browser: submit,
  duplicate, blank, cross-supplier access, buyer access, admin views, and a
  direct SQL `UPDATE` of `raw_text` rejected.

- **Phase 5 (broadcast parser) complete** — per
  `docs/superpowers/plans/2026-11-17-souqfeed-phase5-broadcast-parser.md`.
  `RuleBasedBroadcastParser` (`src/modules/broadcasts/parser/`): pure,
  deterministic, reads brand (incl. family names like ThinkPad → Lenovo),
  model, part number, CPU, RAM, storage, GPU, display, OS, quantity, price,
  currency, and ask-for-price; joins multi-line blocks; treats brand-only lines
  as section headers. 45 parser tests built from real Buraqa lines and the
  documented formats. BullMQ worker (`src/worker/`, Dockerfile stage
  `worker`, compose service `worker`) moves broadcasts PROCESSING → REVIEW
  (or FAILED with a reason in the new `status_note`), with 3 retries and a
  sweeper for stalled broadcasts. Items keep source order (`position`,
  migration `0006`). Detail pages show the products found. Verified in Docker:
  a 14-line broadcast gave 6 correct products, a junk one failed with its
  reason, and a stalled broadcast was picked up by the sweeper.

- **Phase 6 (review + publishing) complete** — per
  `docs/superpowers/plans/2026-11-17-souqfeed-phase6-review-publishing.md`.
  The worker now matches each item to the catalog in the documented order
  (part number 0.98, brand + model 0.92, alias 0.90, family + specs 0.75,
  `pg_trgm` fuzzy ≤ 0.8), with reasons on every result; spec conflicts cap at
  0.7; ≥ 0.9 auto-approves. Suppliers (own broadcasts) and staff review items:
  approve, skip, choose a product through catalog search (`MANUAL`), or skip
  all unmatched; staff can add an unmatched item to the catalog. Publishing
  needs every item decided and one approved, under a row lock. Migrations
  `0007` (`pg_trgm`) and `0008` (`MANUAL` match method, trigram index on
  `products.normalized_title`). Verified in Docker with a browser: each match
  path, the review actions, the publish guard, and staff product creation.

- **Phase 7 (offers) complete** — per
  `docs/superpowers/plans/2026-11-17-souqfeed-phase7-offers.md`. Publishing
  creates or updates one active offer per supplier + product and appends an
  `offer_observations` row per item, in the same transaction as
  `REVIEW → PUBLISHED` (`src/modules/offers/publish.ts`). Availability is never
  guessed (`AVAILABLE` only with a stated quantity, `ASK`, else `UNKNOWN`);
  the spec snapshot is what the supplier stated, filled from the catalog.
  Freshness (LIVE/RECENT/STALE/VERY_STALE) is derived from `lastVerifiedAt`.
  Suppliers: `/dashboard/offers` and offer history pages, with "Sold out" to
  withdraw. Staff: `/admin/offers`. Verified in Docker: two publishes update one
  offer with two history rows; withdrawing then republishing starts a new offer.

- **Phase 8 (public live feed) complete** — `src/modules/offers/market-data.ts`
  loads `/` and `/feed`: **live mode** once any visible offer exists (real
  offers, badges from history, real stats with day-over-day trends, real
  category counts, top suppliers, a 7-day activity chart), otherwise **sample
  mode** with the demo data under a "Sample listings" notice (also the fallback
  if the database is unreachable). In live mode, widgets with no real source yet
  (price movements, trending searches, WTB requests) are hidden, the fake
  "% Positive" score is hidden, the feed tab counts are computed, and the
  desktop feed's simulated "arrivals" (which re-posted offers with invented
  badges every few seconds) are off; they only run on sample data. Parser fix
  found here: a colour straight after the brand is a product line ("WD Blue").
  Verified in Docker in both modes.

- **Phase 9 (search) complete** — per
  `docs/superpowers/plans/2026-11-17-souqfeed-phase9-search.md`. `/search`
  ranks products with live offers in one SQL statement by the seven tiers in
  `docs/search.md` (part number → model → alias → brand → title FTS → spec FTS
  → fuzzy `word_similarity` ≥ 0.5, which catches typos like "thinkpd"), and
  groups each product's matching offers under it with a WhatsApp link. Filters
  (brand, category, supplier, location, price, availability, freshness) are a
  plain GET form, so every search is a shareable URL; empty filters stay out of
  the URL and the panel folds behind a button on phones. Header search goes
  here. Verified in Docker on desktop and mobile against seeded data, including
  a page past the end (still reports the true total).

- **Phase 9.5 (manual offer entry + IT taxonomy) complete** — per
  `docs/superpowers/plans/2026-11-17-souqfeed-phase9.5-manual-offers.md`.
  `/dashboard/offers/new` adds an offer in four steps: category tiles (+
  optional subcategory) → brand (brands known for that category first, filter
  box, all brands) → catalog product (search within the brand, popular ones
  before typing) or "describe the product" with category-specific spec fields
  → condition, fixed price/ask, quantity, warranty, description. Each
  submission is a one-item broadcast with `source = 'FORM'` whose immutable
  text is what the supplier entered, so offers, history, search, and the feed
  work unchanged. A catalog product publishes at once; a described product is
  matched first (an exact part number publishes at once, with the matcher's
  reasons), otherwise it waits in review and publishes itself once staff add it
  to the catalog ("Add to catalog" now keeps the chosen category and specs).
  Offer pages get "Update price & stock" (same form, prefilled; adds a history
  row). Condition is part of an offer's identity (same model new and
  refurbished = two offers). Migration `0009`; seeds now hold 15 top-level IT
  categories with subcategories and ~100 brands. Search and the feed treat a
  category as including its subcategories. Verified in Docker end to end
  (desktop + mobile), including the staff path.

- **Home redesign and public navigation (between 9.5 and 10) complete** — plan
  `docs/superpowers/plans/2026-11-18-souqfeed-public-navigation.md`. The home
  page has a rounded hero banner with the live feed drawn as a phone, feature
  cards, a broadcast-to-offers section, a brand strip and mascot moments (new
  display font, Plus Jakarta Sans, home and list pages only); mobile gets a
  4-column category grid whose last slot opens a bottom sheet. The header has a
  Categories mega menu (top-level list, subcategories, WTB card; hover or
  click; Esc/outside click closes) and real links for Suppliers, WTB Requests
  and How It Works; the mobile menu and bottom nav link to the same pages.
  New pages: `/categories`, `/suppliers` (directory with search, category,
  area, verified and sort filters) and `/wtb`. The WTB page shows **sample**
  requests with a notice, since real buyer requests are still post-launch;
  "Post a request" opens the sign-up dialog. The directory shows demo suppliers
  (with a notice) until the market has live offers, then every active
  supplier.

- **Live chat widget added** — the Zeronix chat widget (`zeronixos.online`) loads on every public page via `src/components/layout/chat-widget.tsx`, in SouqFeed purple, titled "SouqFeed Support" with its own greeting and quick replies. The SouqFeed team answers from the Zeronix portal. Not shown in the admin area; on phones the button is lifted above the bottom tab bar. Planned later: premium suppliers add their own team to a chat once a buyer picks their stock and starts a chat. **The portal rejects origins it doesn't know (CORS), so the button stays hidden on localhost until the SouqFeed domain is allowed there.**

## In Progress

- Nothing currently in flight. Everything since Phase 2 is on
  `phase2-implementation`, not deployed.

## Next

- Phase 10: supplier public profiles (broadcast history, active offers).
- **Deploy, with the production follow-up in Known Issues.** Production needs
  every migration since `0003`, the brand and category seeds, and the admin
  seed (to make the account `SUPER_ADMIN`).

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
- Public self-signup via email/password is intentionally open, as `SUPPLIER`
  or `BUYER`, with no approval gate. `verified` is a trust badge, not a
  visibility gate; `active = false` is what hides a supplier. The `BUYER` role
  was added after Phase 1 and is kept.
- Products are deactivated, never deleted, because broadcast items and offers
  reference them (Rule 9). Brands and categories can only be deleted when unused.
- Admin portal is a separate path (`/admin/login`), not a subdomain. RFQs /
  WTB requests come after launch (first post-launch phase). Phase 12 now covers
  per-user event tracking, IP-based location, and the super admin dashboard.
- Phase 13 now also covers user management, admin management with a last-admin
  safeguard, and an audit log, so an admin can run the system without database
  access.
- Demo supplier pages stay public as a read-only fallback until mock offers are
  replaced (Phase 7), so existing links don't break. They are never written to
  the database, and real suppliers can't take their slugs.
- `proxy.ts` replaces `middleware.ts` — Next.js 16 deprecated and renamed
  the file convention; same logic and `matcher`, new name only.

## Known Issues

- **Production may hold self-made admins.** Until the role fix is deployed, any
  visitor can become `ADMIN`. After deploying, audit `select id, email,
created_at from "user" where role in ('ADMIN', 'SUPER_ADMIN')` and revoke anything unexpected
  (also check for accounts that changed role).
- **`compose.yaml` publishes Postgres as `5432:5432`**, on all host interfaces,
  while `docs/deployment.md` says it publishes no ports. Check whether the server
  exposes it, then remove the mapping unless something needs it.
- **Sample mode.** `/` and `/feed` show real offers once any exist; until then
  they show the illustrative demo listings under a "Sample listings" notice.
  Demo supplier pages and the buyer dashboard (with its hard-coded "120+"
  suppliers) are still mock until Phase 10.
- `src/lib/database/seed-buraqa.ts` stores synthetic text as a raw broadcast and
  marks items `AUTO_APPROVED` at confidence 1.0, with no parsing or review.
  That conflicts with rules 8 and 9. Don't run it in production: if it creates
  offers, they now appear on the public feed as a real company's live stock.
  Rewrite it to go through submit → parse → review, or retire it. (Its guessed
  part numbers and double-encoded JSON were fixed in Phase 3.)
- **Deploying needs seeds as well as migrations:** run the
  `seed-brands` and `seed-categories` commands (re-run them for the Phase 9.5
  IT taxonomy) in `docs/deployment.md`, or the
  supplier form may have no options to offer.
- `db:seed:buraqa` isn't usable in a container, for the same `.env` reason as
  `db:seed`.
- Missing and inactive supplier pages return HTTP 200 with `noindex` rather than
  404, because the root `loading.tsx` starts streaming first. A real 404 would
  need a database lookup in `proxy.ts`.
- `corepack pnpm` fails with pnpm 12.8.1 (`pnpm.cjs` not found); install it with
  `npm install -g pnpm@12.8.1`, as the Dockerfile does.
- `docs/data-model.md` is stale relative to what Task 2/3 actually built:
  it calls the auth table `users` (plural) and types `userId`/`user.id` as
  `uuid`; the real table is `user` (singular) with a `text` primary key.
  Needs a doc-reconciliation pass.
- `docs/data-model.md` specifies an index on `categories.parentId` and on
  `suppliers.verified`/`suppliers.active`; Task 3's migration omitted them
  (deferred, not added speculatively). Add if/when query patterns need them.

- A form submission that staff _skip_ stays in review with nothing to publish;
  the supplier sees it as waiting. Fine at MVP volume; a "rejected" status for
  form submissions would make it explicit.
- The parser doesn't detect condition words ("brand new", "refurbished") in
  pasted broadcasts yet, so pasted offers have no condition unless re-entered
  through the form.

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
- `src/modules/auth/guards.ts`, `src/proxy.ts` — role and portal guard logic (pure, no client import) and route proxy (formerly `middleware.ts`)
- `src/app/admin/login/page.tsx`, `src/app/admin/(panel)/`, `src/components/admin/{admin-login-form,admin-top-bar}.tsx` — separate admin login and admin chrome
- `src/modules/{suppliers,brands,categories,products,broadcasts,offers,analytics}/schema.ts` — full domain schema (12 tables); the same `suppliers`/`offers`/`brands`/`categories` modules also hold Phase 0.5's mock-data fixtures
- `src/modules/suppliers/{validation,profile,queries,service,actions}.ts` — Phase 2's supplier module; the first real instance of the module shape in `docs/architecture.md`
- `src/modules/{brands,categories,products}/{validation,queries,service,actions}.ts`, `src/app/admin/*`, `src/components/admin/*` — Phase 3's catalog and admin screens
- `src/lib/validation/form.ts`, `src/lib/slug.ts`, `src/components/ui/form-field.tsx` — helpers shared by every form
- `src/components/dashboard/{buyer,supplier}-dashboard.tsx`, `src/components/suppliers/supplier-profile-form.tsx`, `src/components/admin/admin-supplier-table.tsx` — Phase 2's screens
- `src/lib/database/seed.ts` — idempotent, self-healing admin-user seed script
- `src/app/login/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/admin/page.tsx` — auth flow + role-gated placeholder pages
- `src/app/page.tsx`, `src/app/suppliers/[slug]/page.tsx` — Phase 0.5's Live Market homepage and Supplier profile page (mock data)
- `docs/seo.md` — SEO strategy: keyword/competitive research, audit, future-pages roadmap
- `public/llms.txt`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/components/seo/json-ld.tsx` — SEO baseline
- `src/components/home/{how-it-works,sample-feedback,location-category-links}.tsx` — home page sections added alongside the SEO baseline
