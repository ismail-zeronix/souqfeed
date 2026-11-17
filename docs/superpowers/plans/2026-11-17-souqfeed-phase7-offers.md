# Phase 7 — Offers

Scope from `project_plan.md`: creation from published items, offer
observations/history. The public feed reads them in Phase 8.

## Publishing creates offers

Inside the same transaction as `REVIEW → PUBLISHED`
(`src/modules/offers/publish.ts`), for each approved item with a product:

- **One offer per supplier + product.** The active offer is locked and
  updated; if none exists, one is created. The database's partial unique
  index on (`supplierId`, `productId`) where `active` backs this. If one
  broadcast lists the same product twice, the first line wins.
- **Every publish appends an `offer_observations` row**: price, currency,
  quantity, availability, and the broadcast item it came from. `offers` holds
  only the current snapshot; history is never overwritten.
- `lastVerifiedAt` = publish time; `publishedAt` stays the first publish.
- `titleSnapshot` = the product title. `specificationSnapshot` = what the
  supplier stated, with the product's stored specs filling only keys the
  supplier didn't mention.
- **Availability** (Rule 10, nothing invented): `AVAILABLE` when a quantity is
  stated, `ASK` when the price is ask-only and no quantity is given, otherwise
  `UNKNOWN`. `LIMITED` is not inferred from quantity.
- Currency stays `null` when no price was given.

## Freshness

`src/modules/offers/freshness.ts`, derived from `lastVerifiedAt` at render
time (`docs/data-model.md`): LIVE < 6 h, RECENT < 24 h, STALE ≤ 3 days,
VERY_STALE after.

## Screens

- Supplier: `/dashboard/offers` (active offers, freshness) and
  `/dashboard/offers/[id]` (price/quantity history). An offer can be
  withdrawn (sold out), which deactivates it; a later broadcast of the same
  product starts a new offer.
- Admin: `/admin/offers`, all suppliers, active or withdrawn, with withdraw.

## Verify

Unit tests for availability, spec snapshot, and freshness; in Docker, publish
a broadcast, publish a second one with a new price, and check one offer with
two observations; withdraw it, and publish again for a new offer.
