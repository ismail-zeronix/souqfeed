# Phase 9.5 — Manual offer entry and IT catalog taxonomy

Requested 2026-11-17: suppliers add products by pasting a broadcast **or** by
filling a form — choose a category, then a brand, then the product, then add a
description and further details — from IT categories and brands that are
already filled in. Slotted between Phase 9 (search) and Phase 10 (supplier
profiles) because Phase 10 shows the offers this creates.

## Core decision: a form submission is a broadcast

Every offer must trace to evidence (rules 8 and 9), and `offers` and
`offer_observations` both require a `broadcast_item_id`. So the form does not
write offers directly. It creates a broadcast with `source = 'FORM'` holding
one item:

- `raw_text` / `raw_line` are a plain rendering of exactly what the supplier
  submitted (product, condition, price, quantity, warranty, notes). They are
  immutable like any broadcast, and show on the broadcast page.
- The item carries the chosen product with `match_method = 'MANUAL'`,
  confidence 1, and a reason ("Chosen by the supplier in the add-offer form:
  …"), approved.
- The broadcast is published in the same transaction through the existing
  publish path, so offer upsert, observations, freshness, search, and the live
  feed all work unchanged.

Updating price or stock on an existing offer uses the same form, prefilled;
the submission becomes a new observation on the same offer.

## When the product isn't in the catalog

The catalog stays staff-curated. The supplier describes the product (model,
optional part number, the spec fields for that category). The description runs
through the existing matcher first: if it auto-matches (≥ 0.9, e.g. an exact
part number), the offer publishes at once with the matcher's reasons. Otherwise
the broadcast waits in REVIEW with one NEEDS_REVIEW item, and the supplier is
told it goes live once SouqFeed adds the product. Staff use the existing
review screen — "Add to catalog" now uses the item's category and extra specs.
A FORM broadcast publishes itself once every item is decided, since the
supplier already asked to publish by submitting.

## New offer details

`offer_condition` enum: `NEW`, `OPEN_BOX`, `REFURBISHED`, `USED`. Plus
`warranty` (short text) and `notes` (up to 1,000 characters, the supplier's
description). On `broadcast_items` (where they are stated) and `offers`
(current values), copied on publish. All nullable: not stated stays null
(Rule 10). The latest listing replaces them, like price and quantity.

Condition is part of an offer's identity: one active offer per supplier +
product + condition, so a supplier can list the same model new and
refurbished. The unique index becomes
`(supplier_id, product_id, coalesce(condition::text, ''))` where active.

`broadcast_items` also gains `category_id` (what the supplier chose, used when
staff add the product) and `extra_specs` jsonb for category-specific fields
beyond the six spec columns (e.g. capacity, interface, panel). Offer spec
snapshots include them.

## Taxonomy

- Categories: the 13 existing top-level categories plus Gaming and Audio &
  Video, each with IT subcategories (e.g. Storage → Internal HDD, Internal
  SSD, NAS, …). Slugs are prefixed by parent so they stay globally unique.
- Brands: ~90 brands traded in the Dubai IT market, each tagged with the
  top-level categories it is known for, so the brand step lists the relevant
  ones first.
- Both live in code (`it-taxonomy.ts`, `it-brands.ts`) with tests for unique
  slugs/names, and the existing idempotent seed scripts insert what's missing
  (never renaming what staff changed).
- Spec templates per top-level category decide which fields the "describe it"
  step shows (laptops: CPU/RAM/storage/GPU/display/OS; storage: capacity,
  interface, form factor; monitors: size, resolution, panel, refresh rate; …).

## Screens

- `/dashboard/offers/new` — one page, four steps that open in turn:
  1. Category tiles, then subcategory chips.
  2. Brand: relevant brands first, filter box, all brands.
  3. Product: catalog search within brand (+ category); recent products shown
     before typing. "Can't find it? Describe it" opens the spec template.
  4. Offer: condition, price + currency or "ask for price", quantity,
     warranty, description.
     After submitting: published → back to the form with a success banner (and
     category + brand kept for the next one); waiting → the broadcast page.
- Offers list and dashboard get "Add offer"; offer detail gets "Update price
  & stock" (form prefilled with that product and condition).
- Condition, warranty, and notes show on the offer page and search results.

## Limits

Form submissions share the per-supplier advisory lock, with their own limit
(120 per hour) so a supplier entering stock by hand isn't capped at the paste
limit of 30.

## Verification

Unit tests: taxonomy/brands integrity, form validation, raw-text rendering,
spec templates. Docker: add a catalog product's offer (publishes), update it
(second observation), add the same product refurbished (second offer), describe
an unknown product (REVIEW → staff add to catalog → auto-publishes), mobile
and desktop screenshots.
