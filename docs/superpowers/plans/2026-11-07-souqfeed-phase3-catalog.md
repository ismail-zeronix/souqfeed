# Phase 3: Brands, Categories, Products

**Goal:** admins manage the canonical catalog that Phases 5–7 match broadcasts
against. This phase builds the catalog and its rules, not the matcher.

## Scope

- `/admin/brands`: add, rename, delete when unused. The slug is set once.
- `/admin/categories`: add, rename, move in the hierarchy, delete when unused.
- `/admin/products`: search, filter, paginate, add, edit, deactivate, and manage
  aliases.
- An admin layout with tabs, re-checking the role on every page and action.

## Decisions

- **Products are deactivated, never deleted.** Broadcast items, offers, and
  analytics reference them, and Rule 9 requires that history stays traceable.
- **Brands and categories can only be deleted when unused.** The foreign keys
  enforce this, and the admin gets a plain message explaining why.
- **Database constraints (Rule 7), in migration `0003`:**
  - one part number per brand; `NULL` means unknown and never collides
  - brand names unique regardless of case
  - category names unique per parent, regardless of case
  - aliases unique per product, regardless of case
- **Part numbers are stored normalized** (uppercase, no spaces), so the matcher's
  "exact part number" rule means something.
- **Specifications are six optional fields** (CPU, RAM, storage, GPU, display,
  OS), matching what the parser will extract. Blank stays absent (Rule 10), and
  other keys already in the JSON survive an edit.
- **Category cycles are rejected** in the service, inside a transaction.
- **Reference data no longer seeds on read.** With admin delete, that would bring
  deleted brands back. `db:seed:brands` and `db:seed:categories` replace it, and
  re-running them doesn't undo an admin's rename.
- **Logos stay out.** No screen shows `brands.logoUrl` yet (Rule 5).

## Existing data

The Buraqa seeder guessed part numbers with a regex, so CPU names such as
`CORE5-120U` were stored as part numbers, with duplicates. These would block the
new constraint and later produce confident wrong matches. Migration `0003` clears
part numbers on rows from that seeder and on any remaining duplicates, and the
seeder now leaves them `NULL`. No product rows are removed.

## Out of scope

- Connecting `/`, `/feed`, or offers to the real catalog (Phases 7–9).
- A trigram index for fuzzy search (Phases 6 and 9).
- User and admin management and the audit log (Phase 13).

## Verification

Unit tests for the pure logic; the migration against a database holding bad rows;
and a browser pass on a production build, including non-admin replays of the admin
actions and a re-run of the Phase 2 flow.
