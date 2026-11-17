# Phase 9 — Search

Scope from `project_plan.md` and `docs/search.md`: `/search`, Postgres FTS +
trigram, filters, results grouped by product.

## Matching and ranking

Only products with at least one visible offer (active offer, active supplier)
that passes the offer filters are searched. Each match gets the best tier it
qualifies for, in the documented order:

1. Part number equals the query (normalized: no spaces, upper case)
2. Model, or brand + model, equals the query (normalized)
3. An alias equals the query
4. The query is the brand name
5. Every query word prefix-matches the title (`to_tsvector('simple', …)`
   with `word:*` terms)
6. Every query word prefix-matches the wider document: brand, family, model,
   part number, category, aliases, and the product's and offers' specs
7. Trigram `word_similarity` of the query against the title ≥ 0.5 (typos; plain
   `similarity` ≥ 0.3 missed "thinkpd e14" against a long title)

The `simple` text-search config is used on purpose: no stemming, so part
numbers and model codes (`i5-1235U`, `21U20063GR`) stay intact, and prefix
terms still match plurals (`laptop` → `laptops`). Within a tier, results are
ordered by text rank, then similarity, then most recently confirmed.

The document is built per query (no stored column) — fine at MVP volumes; a
generated `tsvector` column with a GIN index is the upgrade path.

## Filters

URL parameters, so results are shareable: `q`, `brand`, `category`,
`supplier`, `location`, `price` (`fixed` / `ask`), `availability`
(`available`), `fresh` (`1h` / `24h` / `3d` / `7d`), `page`. Brand and
category filter products; the rest filter offers.

## Results

20 products per page; each shows brand, title, part number, the number of
suppliers, and every matching offer sorted freshest first, then cheapest:
supplier (verified badge, link to profile), price, quantity, freshness, and a
WhatsApp button.

The header search box now opens `/search`.

## Verify

Unit tests for the query and filter parsing; in Docker, products and offers
for each tier (part number, model, alias, brand, title, specs, typo), every
filter, and the empty states.
