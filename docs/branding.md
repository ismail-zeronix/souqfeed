# Branding

> Decision record: `docs/superpowers/specs/2026-09-30-souqfeed-branding-theme-design.md`
> Source mockups: `ui-design-ideas/livefeed-home-ui.png`, `ui-design-ideas/supplier-details-view.png`, `ui-design-ideas/wtb-ui-screen.png`

## Identity

- **Name:** SouqFeed. "Souq" is Arabic for marketplace/bazaar — the name
  reads as "the digital souq's feed," matching the product's actual role as
  a structured layer over an existing bazaar-style trading culture (Dubai's
  WhatsApp-broadcast IT wholesale trade).
- **Logo:** a green faceted-hexagon mark + wordmark, top-left lockup on
  every page.
- **Positioning line:** _"Stop searching hundreds of WhatsApp messages.
  Search the Dubai IT market instead."_
- **Hero copy (shorter variant, for above-the-fold placement):**
  _"Real-time offers. Verified suppliers. Better sourcing."_

## Voice

Terse, factual, market-data language:

- "Live" / "Updated 3m ago" / "Verified Supplier" / "Best price on request"

Never marketing fluff, never cutesy copy. Copy should read like a trading
terminal, not a storefront. Avoid exclamation points, avoid "Shop now"-style
consumer-ecommerce phrasing entirely.

## Personality

A financial-market-terminal-inspired B2B tool: dense, fast, premium,
data-first.

**Explicit non-goals** (do not build toward any of these):

- Cartoonish
- Consumer-ecommerce styling
- Overly colorful
- Crypto-style
- Gaming-style
- "AI-generated" looking (generic gradients, oversized rounded cards, stock
  illustration)

## Scope note — mockups show more than MVP

Both mockups depict the platform's long-term vision, not the MVP cut. They
include:

- A **WTB** (Want To Buy) nav item
- An **Insights** tab
- A supplier **positive-score percentage**
- **Trending-search** rankings
- **Category mix** / **broadcast activity** charts on the supplier profile
- A full **WTB (Want To Buy) request builder** with auto-matching to
  suppliers (`wtb-ui-screen.png`) — request wizard, live "Match Preview"
  (likely suppliers/related offers/active suppliers), top-matching-suppliers
  list with match-quality badges, and a request-management table
  (Open/Drafts/Recent Responses)

All of these are explicitly deferred past MVP by the product roadmap
(`project_plan.md`). `wtb-ui-screen.png` is kept as reference for whenever
WTB and automatic buyer/supplier matching are actually scheduled — it uses
the same visual language (badges, cards, stat tiles) documented in
`docs/theme.md`, so no new tokens are introduced by it. Build every MVP screen to match this visual language
exactly — but do not build these specific features until their phase arrives.
Leave visual room in the navigation for them (don't hard-code a nav with no
space for a later item) without wiring them up.

## Design tokens

See `docs/theme.md` for the concrete color/type/spacing values derived from
these mockups.
