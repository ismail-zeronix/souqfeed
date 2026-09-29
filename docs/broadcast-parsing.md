# Broadcast Parsing & Product Matching

> Decision record: `docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md`

Parsing is a separate domain module (`src/modules/broadcasts/parser/`), not
coupled to UI code. It is deterministic-first: regexes, dictionaries, and
aliases — no LLM calls in MVP.

## Pipeline

```
RAW BROADCAST
      ↓
NORMALIZER            -- whitespace, casing, line/block splitting
      ↓
BLOCK / LINE DETECTOR  -- one broadcast = many product blocks/lines
      ↓
FIELD EXTRACTORS       -- brand, model, part number, CPU, RAM, storage,
                          GPU, display, OS, quantity, price, currency, priceType
      ↓
PRODUCT MATCHER
      ↓
CONFIDENCE CALCULATOR
      ↓
REVIEW (NEEDS_REVIEW items only)
      ↓
PUBLISH
```

## `BroadcastParser` interface

```typescript
interface BroadcastParser {
  parse(input: string): Promise<ParsedBroadcast>;
}
```

`RuleBasedBroadcastParser` is the only implementation built for MVP. The
interface exists so `OpenAIBroadcastParser` / `ClaudeBroadcastParser` /
`GeminiBroadcastParser` / `HybridBroadcastParser` can be added later as
implementations of the same contract, supplementing deterministic extraction
rather than replacing it. Not built now — this is a documented seam, not
active scope.

## Field extraction examples

| Input                                         | Extracted as                                    |
| --------------------------------------------- | ----------------------------------------------- |
| `16/512`                                      | RAM: 16GB, Storage: 512GB                       |
| `U7` / `Ultra 7` / `Core Ultra 7`             | same CPU family, resolved via `product_aliases` |
| `100PCS` / `100 PCS` / `QTY100` / `X100`      | quantity: 100                                   |
| `@1850` / `AED1850` / `1850 AED` / `DHS 1850` | price: 1850, currency: AED                      |
| `ASK` / `CALL` / `BEST PRICE` / `PM`          | priceType: ASK                                  |

## Product matching priority

Implemented in strict order — exact structured data always outranks fuzzy or
AI similarity:

1. Exact part number
2. Exact known SKU
3. Brand + model
4. Model alias (via `product_aliases`)
5. Brand + family + specifications
6. Fuzzy token matching (`pg_trgm`)
7. AI / semantic similarity _(not built in MVP)_

Every match result includes the reasoning, never just a bare confidence
number:

```json
{
  "productId": "…",
  "confidence": 0.98,
  "method": "PART_NUMBER",
  "reasons": ["Exact part number match: 21U20063GR"]
}
```

**Never fabricate a match.** Below the confidence threshold, the item's
`reviewStatus` is `NEEDS_REVIEW` and a human resolves it — the matcher does
not guess to avoid a review step.

## Review states

- `AUTO_APPROVED` — high-confidence match, no human review needed.
- `NEEDS_REVIEW` — below threshold, or no match found.
- `APPROVED` / `REJECTED` — set by a human (supplier or admin) during review.

Suppliers are never forced to fill in every missing specification before
publishing — unresolved fields stay `null` (Rule 10), and unmatched items can
still be published as offers against a newly-created product if the
supplier/admin chooses to.
