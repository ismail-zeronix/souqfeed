# Search

> Decision record: `docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md`

## Stack

Postgres native full-text search + `pg_trgm` for fuzzy/typo-tolerant
matching. No Elasticsearch/OpenSearch — unnecessary at MVP data volumes and
explicitly out of scope per the product brief.

## Ranking order

Search queries (e.g. `21U20063GR`, `Lenovo E14`, `E14 U7 16 512`, `V15 G4`,
`512 SSD laptop`, `WD Purple 8TB`) are ranked in this order:

1. Exact part number
2. Exact model
3. Product alias
4. Brand
5. Product title
6. Specifications (JSONB fields)
7. Fuzzy text (trigram similarity)

## Result shape

Results group supplier offers under their canonical product, not as a flat
offer list:

```
Lenovo ThinkPad E14 Gen 7
21U20063GR
5 suppliers

  Supplier A — AED 3,850 — 120 pcs — Updated 8 mins ago
  Supplier B — ASK       — 50 pcs  — Updated 2 hours ago
```

This is the core success case the product is optimized for (see
`project_plan.md`): a buyer searches a model/spec/part-number and sees every
supplier currently offering it, ranked by freshness and price, in seconds.

## Filters

- Brand
- Category
- Supplier
- Location
- Price available (has a fixed price vs. ASK)
- Availability
- Freshness: last hour / today / last 3 days / last 7 days (see the
  freshness labels in `docs/data-model.md`)

## Route

`/search` — also powers the homepage's search bar and the filtered live
feed view.
