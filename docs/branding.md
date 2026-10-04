# Branding

> Decision record: `docs/superpowers/specs/2026-09-30-souqfeed-branding-theme-design.md`
> Source mockups: `ui-design-ideas/livefeed-home-ui.png`, `ui-design-ideas/supplier-details-view.png`, `ui-design-ideas/wtb-ui-screen.png`
>
> **2026-10-04 brand refresh:** logo mark and primary color replaced per
> `ui-design-ideas/souqfeed-brand-reference.png`. See the "Mascot vs.
> product UI" note below — this refresh changes the logo mark and brand
> color only, not the in-product personality or density.
>
> **2026-10-04 real logo assets:** the vector pack delivered to
> `C:\Users\user\Downloads\souqfeed_exact_vector_assets` replaced the
> placeholder mark. One real bug found in that pack: `souqfeed-logo-exact.svg`,
> `souqfeed-logo-exact-reversed.svg`, and `souqfeed-wordmark-exact.svg` all
> ship an **empty `souq-word` path** (`d=""`) — the mascot and the "Feed"
> half trace correctly, but "Souq" never renders (confirmed against that
> pack's own `souqfeed-exact-vector-proof.png`, which shows the approved
> source with "Souq" and the "corrected vector trace" without it). Rather
> than ship a half-rendered wordmark, the "Souq" and "Feed" glyphs were
> regenerated as real outlined vector paths (no runtime font dependency)
> from Baloo 2 ExtraBold — an open-license (OFL) Google Font chosen for its
> close stylistic match (rounded geometric bold, straight-descender "q") to
> the approved artwork — set in the pack's own `souqfeed-brand.css` colors.
> The traced mascot itself had no defects and is used as-is.

## Identity

- **Name:** SouqFeed. "Souq" is Arabic for marketplace/bazaar — the name
  reads as "the digital souq's feed," matching the product's actual role as
  a structured layer over an existing bazaar-style trading culture (Dubai's
  WhatsApp-broadcast IT wholesale trade).
- **Logo:** a purple gradient ghost-mascot mark + two-tone wordmark
  ("Souq" in ink `#151622`, "Feed" in brand purple), top-left lockup on
  every page.
  - `public/logo-icon.svg` — mascot only (header/footer, next to HTML
    wordmark text)
  - `src/app/icon.svg` — mascot on a rounded dark-plum square (favicon /
    app icon, Next.js auto-icon convention)
  - `public/brand/logo-lockup.svg` — full icon + wordmark, single file,
    light backgrounds
  - `public/brand/logo-lockup-reversed.svg` — full icon + wordmark, dark
    backgrounds (inverted face/eyes, lighter lavender body, white "Souq")
  - `public/brand/mascot-animated.svg` — same mascot with restrained
    float/blink/signal motion, from the source pack; not wired into the
    app yet, kept for the future loading-state/agent use the pack's
    README describes
  - `public/favicon-32.png`, `favicon-64.png`, `apple-touch-icon.png`,
    `android-chrome-192.png`, `android-chrome-512.png` — raster exports
    from the same pack, wired into `src/app/layout.tsx` metadata
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

### Mascot vs. product UI

The purple ghost mascot is a **logo/brand-mark asset only** — header,
footer, favicon, and future marketing placements. It does not license the
non-goals above for the product itself. The in-product trading-floor UI
(live feed cards, filters, stat tiles, badges) keeps its dense,
data-first, non-cartoonish treatment exactly as documented; only the
brand color (green → purple, see `docs/theme.md`) and the logo mark
changed. Do not introduce mascot illustrations, bouncy animation, or
oversized rounded cards into the feed/filter/profile screens on the
strength of this refresh.

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
