# Theme

> Decision record: `docs/superpowers/specs/2026-09-30-souqfeed-branding-theme-design.md`
> Source mockups: `ui-design-ideas/livefeed-home-ui.png`, `ui-design-ideas/supplier-details-view.png`

Colors below are **visual-inspection estimates** read off the mockups, not
sampled pixel values. Treat as a strong starting palette — refine to exact
values during the actual Tailwind/shadcn theming pass, not as measured
ground truth.

## Color tokens

| Token                   | Estimate                    | Used for                                                    |
| ----------------------- | --------------------------- | ----------------------------------------------------------- |
| `--color-bg`            | `#F7F6F3`                   | Page background (warm off-white)                            |
| `--color-surface`       | `#FFFFFF`                   | Cards, panels                                               |
| `--color-text-primary`  | `#16181A`                   | Body text, headings (near-black charcoal)                   |
| `--color-text-muted`    | `#6B7280`                   | Secondary text, specs, labels                               |
| `--color-border`        | `#E5E3DE`                   | 1px hairline borders                                        |
| `--color-brand-primary` | `#0F6B45`                   | Logo, primary buttons, verified check, active nav underline |
| `--color-live-accent`   | `#16A34A`                   | LIVE status dot, positive-stat trend arrows                 |
| `--color-info`          | blue-grey (exact value TBD) | LIVE / PRICE UPDATED badges                                 |
| `--color-negative`      | `#DC2626`                   | Price-down trend arrows                                     |

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
