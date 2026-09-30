# SouqFeed — UI Foundation Design (Phase 0.5)

**Date:** 2026-09-30
**Status:** Proposed
**Source:** `ui-design-ideas/livefeed-home-ui.png`, `ui-design-ideas/supplier-details-view.png`, `docs/theme.md`, `docs/branding.md`, `docs/data-model.md`
**Supersedes:** none (new phase; does not change `docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md` or the Phase 1 plan)

## Problem

`project_plan.md`'s phase order builds the database and auth first (Phase
1), then styles each screen as its owning phase arrives (Phase 2 = supplier
profile, Phase 8 = live feed, ...). The Phase 1 plan explicitly scopes real
UI out: "the login page and placeholder dashboard/admin pages are
deliberately unstyled." The user wants the reverse for the two flagship
screens: build the real visual design now, against static mock data, then
wire each screen to its real data source when that screen's phase lands.

This spec records that reordering and the concrete design for the new
phase it creates, so implementation doesn't drift from the mockups or
re-litigate scope decisions `docs/branding.md` already locked.

## Decisions

### Phase-order amendment

Insert **Phase 0.5 — UI Foundation** between Phase 0 (done) and Phase 1
(planned, unstarted). `project_plan.md`'s phase table gets a new row; Phase
1 itself is unchanged — it still builds the real schema/auth, and later
phases (2, 7, 8, 10) swap this phase's mock data for real queries without
touching the components. `current.md`'s "Next" section is updated to point
here first. Both edits are Task 1 of the implementation plan, not this spec.

### Screen scope

Two screens, matching the two source mockups:

- **Homepage / Live Market** — `src/app/page.tsx`
- **Supplier profile** — `src/app/suppliers/[slug]/page.tsx`

Not built now: a `/search` results page, the WTB request builder, and an
Insights page/tab body. Nav keeps visual space for `Suppliers`, `Search`,
`WTB`, and `Insights` (unwired — no `href` target, non-interactive
styling) so the header layout doesn't need reshaping when those phases
land. `Live Market` is the only working nav link. `Sign In` is a styled,
non-functional button — Phase 1 owns building and styling the real login
page.

### Handling metrics the mockups show but the schema doesn't have yet

`docs/branding.md`'s own scope note (written before this conversation)
already marks several mockup elements as deferred past MVP: supplier
positive-score %, trending-search rankings, and the supplier profile's
category-mix/broadcast-activity charts. None of these have a backing field
in `docs/data-model.md`. Per explicit user direction, this phase recreates
them visually anyway, with clearly-marked placeholder data, rather than
omitting them:

- Every such value is typed as an explicit placeholder field (e.g.
  `SupplierSummary.positiveScorePercent`) with a one-line comment marking
  it `// placeholder — no backing schema field yet`, so a future pass
  wiring real data can grep for exactly what still needs a real source.
  This isn't a schema decision — it's a marker in mock-data/type files
  only, so it costs nothing to delete once real data exists.
- Applied consistently to: supplier positive-score %, the homepage's
  "Price Movement" tab and per-category trend arrows, "Trending Today"
  (search-term rankings), "Latest WTB Requests" (read-only snippet list,
  not the WTB builder itself), and the supplier profile's category-mix
  donut + broadcast-activity bar chart.
- Fields that already exist in `docs/data-model.md` are treated as real
  mock data, not placeholders: `verified`, offer counts, brand/category
  distributions computed from mock offers, "active since" computed from
  `createdAt`.

### Component architecture

Follows `docs/architecture.md`'s existing folder convention
(`components/ui/ market/ suppliers/`), with one small addition:
`components/layout/` for the site header — cross-page chrome that isn't a
generic shadcn primitive and doesn't belong to the `market` or `suppliers`
domain either. Everything else slots into the four folders
`docs/architecture.md` already names.

```
src/components/
  layout/
    site-header.tsx        # logo, nav (Live Market wired, rest unwired), sign-in button
  ui/
    badge-status.tsx        # NEW / LIVE / PRICE UPDATED pill, variant-driven
    stat-tile.tsx            # icon + number + label + trend arrow
    supplier-logo-tile.tsx   # square bordered logo, brand-color fallback
    sidebar-widget.tsx       # title + "View all" + row list, used by both pages
  market/
    market-hero.tsx          # search bar + category select + stat tile row
    live-market-card.tsx     # THE shared card; action label is a prop
                              # ("View Supplier" vs "View Product") so the
                              # same component serves both screens
    live-market-feed.tsx     # sort/view-toggle + card list, consumes filtered data
    filters-sidebar.tsx      # brand/category/location/availability/freshness
    market-pulse-sidebar.tsx # composes sidebar-widget: trending categories/
                              # price movement, trending today, top active
                              # suppliers, latest WTB requests
  suppliers/
    supplier-header.tsx      # logo, name, badges, contact actions, cover
    supplier-stat-row.tsx    # composes stat-tile
    supplier-tabs.tsx        # shadcn Tabs: Live Offers/History/About/Brands/Contact
    supplier-insights-sidebar.tsx # composes sidebar-widget: top brands,
                                   # category-mix donut, broadcast-activity
                                   # bars, market trust signals
    supplier-contact-panel.tsx    # contact info + business hours cards
    category-mix-donut.tsx        # small hand-rolled inline SVG, no charting lib
    broadcast-activity-bars.tsx   # small hand-rolled inline SVG, no charting lib
```

Page files (`src/app/page.tsx`, `src/app/suppliers/[slug]/page.tsx`) stay
thin: they read the mock data, pass it to the section components above,
and hold no layout or business logic of their own — per the reuse/thin-page
workflow given for this phase. `live-market-card.tsx` is written once and
reused by both screens (the single most-repeated component in the
product, per `docs/theme.md`).

Two small hand-rolled SVG components, not a charting library: the donut
and bar visuals are static displays of a handful of fixed values, not
interactive/real-time charts — adding a charting dependency now would be
speculative ahead of Phase 12 (analytics), which is where real
time-series data and any actual charting need first appears.

### Mock data & type strategy: real seams, fake data

Each relevant module gets its `types.ts` and a temporary `mock-data.ts`
now, following the module layout `docs/architecture.md` already locks in
(`schema.ts types.ts validation.ts service.ts queries.ts actions.ts` — this
phase only populates the first and a stand-in for the last two):

```
src/modules/
  suppliers/  types.ts  mock-data.ts
  offers/     types.ts  mock-data.ts
  brands/     types.ts  mock-data.ts
  categories/ types.ts  mock-data.ts
```

`types.ts` defines view types trimmed to what the UI needs (e.g.
`OfferListItem`, `SupplierSummary`, `SupplierProfile`), field-matched to
`docs/data-model.md` wherever a real field exists. `mock-data.ts` exports
static fixture arrays plus plain accessor functions with the same shape
their real `queries.ts` counterparts will eventually have (e.g.
`getMockOffers(filters)`, `getMockSupplierBySlug(slug)`). When Phase 1's
schema and each feature phase's real `queries.ts` land, pages swap the
mock accessor import for the real one — components never change, because
they only ever consumed the view type, not the mock module directly.

This is the one place this phase adds files ahead of their "real" phase.
It's justified because the alternative (inline, ad-hoc shapes in page
components) gets thrown away rather than swapped, and `docs/architecture.md`
already committed to this module boundary — this just populates it early
for parts the UI needs.

### Filtering & interactivity

Plain React state (`useState`) in a client-component wrapper around the
homepage's filter sidebar + card feed; filters/sort call
`filterOffers(offers, criteria)` — a pure function in
`src/modules/offers/` — and re-render. No URL sync, no new state library:
Phase 9 (real search) will design its own state/URL strategy against a
real FTS query, which may look nothing like client-side array filtering.
`filterOffers` is the one piece of this phase with real unit-test value
(pure function, no DOM) and gets Vitest tests alongside it, matching the
existing `env.test.ts`/`logger.test.ts` pattern. No React Testing
Library / jsdom is added — that would be a new dependency without a
current problem it solves; component correctness is verified by running
`pnpm dev` and checking the browser, per the project's existing UI
verification rule.

### Theme tokens

Applied onto the existing shadcn CSS-variable slots in
`src/app/globals.css` (Tailwind v4, `@theme inline` block) rather than
inventing a parallel token set:

| shadcn slot | New value | Source |
|---|---|---|
| `--background` | `#F7F6F3` | `--color-bg` |
| `--foreground` | `#16181A` | `--color-text-primary` |
| `--card`, `--popover` | `#FFFFFF` | `--color-surface` |
| `--primary` | `#0F6B45` | `--color-brand-primary` |
| `--primary-foreground` | `#FFFFFF` | — |
| `--muted-foreground` | `#6B7280` | `--color-text-muted` |
| `--border`, `--input` | `#E5E3DE` | `--color-border` |
| `--destructive` | `#DC2626` | `--color-negative` |

Two tokens `docs/theme.md` defines but shadcn has no slot for get added
directly to the `@theme inline`/`:root` blocks:

- `--live: #16A34A` — the small LIVE status dot and positive trend arrows
  (not the LIVE badge fill).
- `--info: #2A5C8A` — finalizes `docs/theme.md`'s "exact value TBD" —
  used for both the LIVE badge fill and the PRICE UPDATED badge fill, per
  that doc's own table (one token, two badge types).
- NEW badge fill reuses `--primary` (brand green); the VERIFIED mark is
  an icon in `--primary`, not a filled pill.

Also fixed as part of this pass (pre-existing bug, not new scope): the
`@theme inline` block currently maps `--font-sans: var(--font-sans)`
(self-referential) instead of `var(--font-geist-sans)`, so the Geist font
`layout.tsx` loads isn't actually applied via the `font-sans` utility.
Numeric columns (price, quantity, SKU, timestamps) get Tailwind's built-in
`tabular-nums` utility, per `docs/theme.md`'s alignment requirement — no
new library.

### Screen breakdown

**Homepage (`/`)** — user goal: see what's live right now across Dubai IT
wholesale suppliers and act on it (search, filter, contact via WhatsApp,
or drill into a supplier). Primary action: search/filter the feed and
message a supplier. Secondary: browse Market Pulse, switch list/grid view,
sort.

- Desktop: header → hero (search + category select + 4 stat tiles) →
  three-column body — filters sidebar (sticky) | live market feed
  (primary) | Market Pulse sidebar.
- Mobile: hero collapses to full width, stat tiles become a 2x2 grid,
  filters sidebar becomes a "Filters" trigger opening a sheet/drawer, feed
  becomes the single primary column, Market Pulse sidebar moves below the
  feed.
- Reused components: `site-header`, `stat-tile`, `badge-status`,
  `supplier-logo-tile`, `live-market-card`, `sidebar-widget`.
- New components: `market-hero`, `live-market-feed`, `filters-sidebar`,
  `market-pulse-sidebar`.

**Supplier profile (`/suppliers/[slug]`)** — user goal: verify a
supplier's legitimacy and see everything currently in stock from them,
then contact them. Primary action: contact (WhatsApp primary; Call/Email/
Visit Location secondary) and browse/search/filter that supplier's live
offers. Secondary: check trust signals, browse other tabs (Broadcast
History/About/Brands & Categories/Contact), read Supplier Insights.

- Desktop: breadcrumb → header block (logo, name+badges, contact actions,
  description, tags, cover+location) → stat row (6 tiles) → tabs → two
  columns under tabs — offers list+filters (primary, ~70%) | Supplier
  Insights + Market Trust Signals + Contact Info + Business Hours
  (~30%).
- Mobile: header block stacks (logo above name, action buttons wrap),
  stat row scrolls horizontally, tabs scroll horizontally, sidebar
  content moves below the offers list.
- Reused components: `site-header`, `stat-tile`, `supplier-logo-tile`,
  `live-market-card` (same component, `actionLabel="View Product"`),
  `sidebar-widget`, `badge-status`.
- New components: `supplier-header`, `supplier-stat-row`,
  `supplier-tabs`, `supplier-insights-sidebar`, `supplier-contact-panel`,
  `category-mix-donut`, `broadcast-activity-bars`.

### File size discipline

Any component file that grows past roughly one clear responsibility (a
`live-market-feed.tsx` that starts also owning filter logic, e.g.) gets
split before it grows further — per the project's no-giant-files rule.
Sort/view-toggle controls, if they grow beyond a few lines, become their
own small component under `market/` rather than living inline in
`live-market-feed.tsx`.

## Out of scope

- Dark mode (not specified anywhere; explicit non-goal for MVP per
  `docs/theme.md`).
- Pixel-perfect mobile design — basic responsive collapse only.
- `/search` results page, WTB request builder page, Insights page body.
- Any real data fetching, auth, or database connection — Phase 1 and
  later feature phases own that; this phase only produces mock data and
  the seam to replace it.
