# Theme

> Decision record: `docs/superpowers/specs/2026-09-30-souqfeed-branding-theme-design.md`
> Source mockups: `ui-design-ideas/livefeed-home-ui.png`, `ui-design-ideas/supplier-details-view.png`
>
> **2026-10-04 brand refresh:** brand color and logo mark replaced per
> `ui-design-ideas/souqfeed-brand-reference.png` (purple ghost mascot).
> Only `--color-brand-primary` and the new `--color-brand-dark` changed —
> every other token, the density rules, and the recurring components below
> are unchanged. See `docs/branding.md`'s "Mascot vs. product UI" note.
>
> **2026-10-04 exact values from source pack:** `--color-brand-primary`
> and `--color-brand-dark` below are no longer visual estimates — they're
> taken directly from the delivered vector pack's `souqfeed-brand.css`
> (`--sf-purple` / `--sf-plum`), which also defines `#151622` (ink, the
> "Souq" wordmark color) and `#A88AFF` (lavender, the reversed-logo body
> color). See `docs/branding.md` for the asset bug found and fixed in that
> pack.

Colors below are **visual-inspection estimates** read off the mockups, not
sampled pixel values. Treat as a strong starting palette — refine to exact
values during the actual Tailwind/shadcn theming pass, not as measured
ground truth.

## Color tokens

| Token                   | Estimate                    | Used for                                                                             |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------ |
| `--color-bg`            | `#F7F6F3`                   | Page background (warm off-white)                                                     |
| `--color-surface`       | `#FFFFFF`                   | Cards, panels                                                                        |
| `--color-text-primary`  | `#16181A`                   | Body text, headings (near-black charcoal)                                            |
| `--color-text-muted`    | `#6B7280`                   | Secondary text, specs, labels                                                        |
| `--color-border`        | `#E5E3DE`                   | 1px hairline borders                                                                 |
| `--color-brand-primary` | `#6C42F5` (exact)           | Logo wordmark accent, primary buttons, verified check, active nav underline          |
| `--color-brand-dark`    | `#28105F` (exact)           | Dark brand surfaces — hero photo overlay, footer background, app-icon bg             |
| `--color-live-accent`   | `#16A34A`                   | LIVE status dot, positive-stat trend arrows (unchanged — decoupled from brand color) |
| `--color-info`          | blue-grey (exact value TBD) | LIVE / PRICE UPDATED badges                                                          |
| `--color-negative`      | `#DC2626`                   | Price-down trend arrows                                                              |

## Typography

- **Font:** Inter or Geist.
- **Numerals:** tabular/monospace figures for price, SKU, quantity, and
  timestamp columns, so these align vertically in lists — visible in both
  mockups' aligned numeric columns.

## Density & surface treatment

- Compact cards, tight vertical rhythm, small badges.
- Thin 1px borders; minimal shadow use.
- This density is load-bearing for the "trading floor, not storefront" feel
  — resist adding whitespace or shadow "for polish."

## Recurring components

Build these as shared components, not per-page markup — they repeat across
multiple screens in the mockups:

| Component          | Appears in                      | Notes                                                                                                                                                                                                                       |
| ------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Badge              | Both                            | NEW / LIVE / PRICE UPDATED / VERIFIED. Small pill. Use sparingly — only where it communicates real state.                                                                                                                   |
| Stat tile          | Homepage hero, supplier profile | icon + number + label + trend arrow                                                                                                                                                                                         |
| Supplier logo tile | Both                            | Square, bordered; brand-colored fallback when no logo set                                                                                                                                                                   |
| Live-market card   | Homepage, supplier profile      | supplier + badge → brand/category tags → title → spec line → quantity → price/ASK → "posted Xm ago" → View Supplier + WhatsApp actions. The single most-repeated component in the product.                                  |
| Sidebar widget     | Both                            | Title + "View all" link + short list of rows. Homepage: Market Pulse, Top Active Suppliers, Latest WTB Requests. Profile: Supplier Insights. Only MVP-relevant instances get built now — see `docs/branding.md` scope note. |

## Dark mode

Not specified anywhere in the product brief or the mockups. Out of scope for
MVP; revisit only if explicitly requested.
