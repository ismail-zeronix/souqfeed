# Phase 4 — Broadcast Submission

Scope from `project_plan.md`: paste, store raw text, status lifecycle.

## Decisions

- **Submission stores the text exactly as pasted** (no trimming or line-ending
  changes) with status `PROCESSING` and source `MANUAL`. It is rejected only
  if it's blank after trimming, or over 50,000 characters.
- **Raw text is immutable in the database**, not just in the code (Rule 7/8).
  Migration `0005` adds triggers that reject any `UPDATE` changing
  `broadcasts.raw_text` or `broadcast_items.raw_line`.
- **No queue yet.** BullMQ and the worker arrive in Phase 5 with the parser,
  the first job they would run (Rule 6). Until then a submitted broadcast
  waits in `PROCESSING` and the supplier sees "Waiting to be read".
- **Lifecycle** (`src/modules/broadcasts/status.ts`, tested):
  `DRAFT → PROCESSING`, `PROCESSING → REVIEW | FAILED`,
  `FAILED → PROCESSING` (retry), `REVIEW → PUBLISHED`. `PUBLISHED` is final.
  `transitionBroadcastStatus` updates with `where status = from`, so two
  workers can't both move the same broadcast.
- **Who can submit**: a `SUPPLIER` with a profile that SouqFeed hasn't
  deactivated. Abuse guards: at most 30 broadcasts per supplier per hour,
  and an identical text from the same supplier within 2 minutes returns the
  existing broadcast instead of a duplicate (a double-submit guard).
- Broadcasts are never deleted from the app.

## Screens

- Supplier: `/dashboard/broadcasts` (history, paginated),
  `/dashboard/broadcasts/new` (paste form), `/dashboard/broadcasts/[id]`
  (raw text, status, line count). The dashboard links to them.
- Admin: `/admin/broadcasts` (every broadcast, filter by status, paginated)
  and `/admin/broadcasts/[id]`, with a sidebar entry under Marketplace.

## Verify

Unit tests for validation and the lifecycle; build; in Docker, submit as a
supplier, see it in both lists, confirm a direct SQL `UPDATE` of `raw_text`
fails, confirm a buyer and an admin can't submit.
