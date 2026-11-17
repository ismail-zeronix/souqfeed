# Phase 5 — Broadcast Parser

Scope from `project_plan.md`: `RuleBasedBroadcastParser`, deterministic
extraction. Product matching is Phase 6.

## Pipeline

```
submit (Phase 4) → broadcasts row, PROCESSING
  → enqueue "parse-broadcast" job (BullMQ, jobId = broadcastId)
  → worker: RuleBasedBroadcastParser.parse(rawText, { brands })
  → one transaction: replace this broadcast's items, PROCESSING → REVIEW
    (or → FAILED with a reason when nothing could be read)
```

## Parser (`src/modules/broadcasts/parser/`)

- **Pure and deterministic**: no I/O, no network, no randomness. The worker
  passes the brand names from the database in.
- **Extraction works on a character mask over the original line**. Each
  extractor claims the characters it used (price first, then quantity, CPU,
  GPU, memory/storage, display, OS, part number), so a number is never read
  twice (e.g. `512` as both storage and price). What's left, minus noise
  words (colour, keyboard, condition), is the model, in its original casing.
- **Blocks**: blank lines separate blocks. A line with a brand starts an item;
  following lines without a brand add details to it (multi-line products). A
  brand-only line that never gets details is a section header and is
  dropped. Lines with no product information are skipped.
- **Rule 10**: anything not found stays `null`. Currency is `AED` only when a
  price was found with no other currency (the market's convention, e.g.
  `@1850`); with no price, currency is `null`. Family names map to brands
  only when unambiguous (ThinkPad → Lenovo, EliteBook → HP, Latitude → Dell…).
- Unlabelled part numbers must look like one (at least 6 characters, 3 or
  more digits and 2 or more letters); labelled ones (`P/N`, `PN`, `SKU`)
  are taken as written.

## Worker (`src/worker/`)

- `pnpm worker` runs it (`pnpm worker:dev` loads `.env` locally). New
  Dockerfile stage `worker`; a `worker` service in both compose files.
- Retries: 3 attempts with backoff; after the last, the broadcast is marked
  `FAILED` with a reason.
- **Sweeper**: every minute, broadcasts stuck in `PROCESSING` for 2+ minutes
  are re-enqueued (same jobId, so no duplicates). This covers a submission
  made while Redis was down.
- New column `broadcasts.status_note` (migration `0006`) holds the failure
  reason shown to the supplier.

## Verify

Parser unit tests against real market lines (the Buraqa catalog and common
formats from `docs/broadcast-parsing.md`); build; in Docker, submit a
broadcast and watch it move to REVIEW with items, and a junk broadcast to
FAILED.
