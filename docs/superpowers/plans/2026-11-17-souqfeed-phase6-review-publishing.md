# Phase 6 — Review + Publishing

Scope from `project_plan.md`: product matcher, NEEDS_REVIEW UI, publish flow.
Creating offers from published items is Phase 7; publishing here moves the
broadcast to `PUBLISHED` and freezes its review decisions, and Phase 7 hooks
offer creation into the same transaction.

## Matcher (`src/modules/broadcasts/matcher/`)

Runs in the worker right after parsing, in the documented strict order. Only
active products are candidates. A candidate whose brand differs from a
detected brand is never used.

| Method              | When                                                         | Confidence               |
| ------------------- | ------------------------------------------------------------ | ------------------------ |
| `PART_NUMBER`       | exact normalized part number                                 | 0.98                     |
| `BRAND_MODEL`       | same brand, model equals the product's model/family/title    | 0.92                     |
| `ALIAS`             | model (or brand + model) equals one of the product's aliases | 0.90                     |
| `BRAND_FAMILY_SPEC` | same brand, product family appears in the model              | 0.75                     |
| `FUZZY`             | same brand, `pg_trgm` similarity ≥ 0.5 on the title          | similarity × 0.8 (≤ 0.8) |
| `NONE`              | nothing                                                      | —                        |

- `SKU` is skipped: products have no SKU column; part numbers cover it.
- **Several candidates at one level**: specs pick the single best one if they
  can; otherwise the best is only a suggestion (0.6, needs review).
- **Spec conflicts** (CPU model, RAM, storage differ from the product's stored
  specs) cap confidence at 0.7 and are listed as reasons.
- `AUTO_APPROVED` at ≥ 0.9; everything else `NEEDS_REVIEW`. Every result
  carries reasons (Rule 9). No match means no product (Rule 10).
- Migration adds `pg_trgm` + a GIN trigram index on `products.normalized_title`
  and a `MANUAL` match method for products chosen during review.

## Review (supplier who owns the broadcast, or staff)

While a broadcast is in `REVIEW`, each item can be approved (needs a product),
rejected (left out of publishing), or given a different product through a
catalog search (`MANUAL`, confidence 1). "Skip unmatched" rejects every item
without a product. Staff can also create a catalog product from an unmatched
item (brand must exist; the item is then approved against it).

## Publish

Allowed when no item still needs review and at least one is approved.
`REVIEW → PUBLISHED`, `publishedAt` set, all in one transaction with the
status check, so a double click can't publish twice.

## Verify

Unit tests for spec comparison and match decisions; build; in Docker, seed a
few catalog products, post a broadcast, and check auto-approved, suggested,
and unmatched items, then review and publish as the supplier.
