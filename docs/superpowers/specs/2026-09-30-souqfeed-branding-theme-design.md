# SouqFeed — Branding & Theme Design

**Date:** 2026-09-30
**Status:** Approved
**Source:** `ui-design-ideas/livefeed-home-ui.png`, `ui-design-ideas/supplier-details-view.png`
**Supersedes:** none (first spec)

## Problem

The product brief specifies a visual _personality_ (Section 18: professional,
dense, premium, financial-market-like) but not a brand identity or concrete
design tokens. The user supplied two UI mockups that answer both — this spec
records what they establish as decisions, so implementation doesn't
re-derive or drift from them later.

## Decisions

### Identity

- **Name: SouqFeed.** "Souq" is Arabic for marketplace/bazaar — the name
  reads as "the digital souq's feed," which matches the product's actual
  positioning (a structured layer over an existing bazaar-style trading
  culture) better than a generic name would.
- **Logo:** a green faceted-hexagon mark paired with the wordmark "SouqFeed,"
  set top-left in every page's header, per both mockups.
- **Positioning line:** _"Stop searching hundreds of WhatsApp messages.
  Search the Dubai IT market instead."_ (already present in the product
  brief; the mockups' hero copy — "Real-time offers. Verified suppliers.
  Better sourcing." — is a secondary, shorter variant for hero placement.)
- **Voice:** terse, factual, market-data language — "Live," "Updated 3m ago,"
  "Verified Supplier," "Best price on request." Never marketing fluff,
  never cutesy copy. Copy reads like a trading terminal, not a storefront.
- **Personality:** a financial-market-terminal-inspired B2B tool — dense,
  fast, premium, data-first. Explicit non-goals, carried directly from the
  product brief and reconfirmed by the mockups: not cartoonish, not
  consumer-ecommerce, not overly colorful, not crypto-style, not
  gaming-style, not "AI-generated" looking.

### Scope note: mockups show more than MVP

Both mockups depict the platform's long-term vision, not the MVP cut. They
include a **WTB** (Want To Buy) nav item, an **Insights** tab, a supplier
**positive-score percentage**, **trending-search** rankings, and **category
mix** / **broadcast activity** charts on the supplier profile page — all of
which the product brief's Section 34/35 explicitly defers past MVP (along
with star ratings, which the positive-score badge is adjacent to but distinct
from — it's a percentage, not stars, so it isn't itself excluded, but it
depends on a review/feedback system that doesn't exist yet in MVP and should
not be fabricated).

**Rule for implementation:** build every MVP screen to match this visual
language exactly (colors, type, density, card/badge patterns), but do not
build the WTB tab, Insights tab, trend charts, or trust-score badge until
their owning phase arrives on the roadmap. Leave visual room for them in the
navigation (e.g. don't hard-code a 3-item nav that has no space for a 5th
item later) without wiring them up.

### Visual tokens

Colors below are **visual-inspection estimates** from the mockups — read off
the rendered screenshots, not sampled pixel values. Treat them as a strong
starting palette to refine with exact values during the actual Tailwind/CSS
implementation pass, not as measured ground truth.

| Token                   | Estimate                                      | Used for                                                        |
| ----------------------- | --------------------------------------------- | --------------------------------------------------------------- |
| `--color-bg`            | `#F7F6F3` (warm off-white)                    | Page background                                                 |
| `--color-surface`       | `#FFFFFF`                                     | Cards, panels                                                   |
| `--color-text-primary`  | `#16181A` (near-black charcoal)               | Body text, headings                                             |
| `--color-text-muted`    | `#6B7280` (mid grey)                          | Secondary text, specs, labels                                   |
| `--color-border`        | `#E5E3DE` (light grey)                        | 1px hairline borders — minimal shadow use                       |
| `--color-brand-primary` | `#0F6B45` (deep green)                        | Logo, primary buttons, verified check, active nav underline     |
| `--color-live-accent`   | `#16A34A` (brighter emerald)                  | LIVE status dot, positive-stat trend arrows                     |
| `--color-info`          | blue-grey (exact value TBD at implementation) | LIVE / PRICE UPDATED badges — distinct from the green NEW badge |
| `--color-negative`      | `#DC2626` (red/orange)                        | Price-down trend arrows                                         |

- **Typography:** Inter or Geist, per the product brief. Tabular/monospace
  numerals for price, SKU, quantity, and timestamp columns — visible in the
  mockups' aligned numeric columns.
- **Density:** compact cards, tight vertical rhythm, small badges, thin 1px
  borders, minimal shadow. This is the load-bearing visual cue that makes it
  read as a trading floor rather than a storefront — implementation should
  resist the instinct to add whitespace or shadow "for polish."
- **Recurring component patterns** implied by both mockups (build as shared
  components, not per-page markup):
  - **Badge** — NEW / LIVE / PRICE UPDATED / VERIFIED, small pill, one of the
    accent colors above, used sparingly (per the brief: "use them only where
    they communicate meaningful state").
  - **Stat tile** — icon + number + label + trend arrow, used in the
    homepage hero strip and the supplier profile stats row.
  - **Supplier logo tile** — square, bordered, brand-colored fallback when no
    logo is set.
  - **Live-market card** — supplier + badge, brand + category tags, title,
    spec line, quantity, price/ASK, "posted Xm ago," View Supplier + WhatsApp
    actions. This is the single most-repeated component in the product;
    worth its own focused component file.
  - **Sidebar widget** — title + "View all" link + a short list of rows,
    reused for "Market Pulse," "Top Active Suppliers," "Latest WTB Requests"
    (homepage) and "Supplier Insights" (profile page). Only the MVP-relevant
    instances get built now.
- **Dark mode:** not specified anywhere in the brief or the mockups. Out of
  scope for MVP; revisit only if explicitly requested.

## Consequences

- `docs/branding.md` and `docs/theme.md` carry this content forward as living
  references; this spec is the historical record of _why_ each choice was
  made, in case a later session needs to know whether a value is a firm
  decision or a placeholder.
- Because the mockups show post-MVP features, anyone building from
  `docs/theme.md` alone (without this spec's scope note) could
  over-build. The scope note above is deliberately also duplicated into
  `docs/branding.md` for that reason.
