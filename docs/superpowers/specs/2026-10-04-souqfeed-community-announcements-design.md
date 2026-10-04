# SouqFeed — Community (Supplier Announcements) Design

**Date:** 2026-10-04
**Status:** Approved (documentation only — implementation deferred to Phase 15)
**Supersedes:** none

## Problem

A "community page" was floated for SouqFeed. Nothing in `project_plan.md`
or the product brief defines what that means here — the term doesn't
appear anywhere in the locked scope, and the explicit non-goals list
already rules out buyer reviews/star ratings. Before any design could
proceed, the idea needed to be narrowed from "community" (which could mean
anything from a forum to a review system) down to something specific that
doesn't conflict with SouqFeed's stated identity: a B2B discovery layer
with a terse, "trading terminal" voice, not a consumer/social product.

This spec records the narrowed idea, reached through brainstorming, and
its data model/workflow/placement — so the team can build it later without
re-deriving these decisions or re-opening settled questions.

## Decisions

### What this is

A **supplier-to-supplier industry announcements feed**: verified suppliers
post short text updates (price alerts, shortages, events, general market
notes) that other suppliers and the public can read. It is explicitly:

- **Not** a buyer-facing feature — buyers have no account system in
  SouqFeed (they contact suppliers via WhatsApp and stay anonymous), so
  nothing here is built around buyer identity.
- **Not** a forum or social feed — no replies, no comments, no threads.
- **Not** a review/rating system — untouched, stays a product non-goal.

### Rejected alternatives

Considered and rejected during brainstorming, recorded so they aren't
re-proposed without a new reason:

- **Buyer-supplier engagement board** (want-to-buy style posts buyers
  create, suppliers respond to) — rejected because it requires buyer
  accounts, which don't exist and aren't planned for MVP; this is
  materially the existing deferred **WTB** item, not this feature.
- **Supplier-to-supplier sourcing** (suppliers browsing each other's live
  offers as buyers) — rejected as the core idea; it's really just the
  existing offers feed viewed differently, not a new feature.
- **Threaded replies/comments** — rejected to keep the brand's terse,
  non-social voice, and to avoid the moderation surface a comment system
  adds (disputes, spam, abuse-in-replies) before there's any evidence
  suppliers want it.
- **Immediate publish with after-the-fact admin removal** — rejected in
  favor of pre-approval, to match the one review pattern this codebase
  already commits to (broadcasts: `DRAFT → PROCESSING → REVIEW →
PUBLISHED`) rather than introducing a second, differently-shaped trust
  model.
- **Structured posts** (category tag, or a link to a specific
  brand/category/product) — rejected for v1; plain text is enough to
  validate whether suppliers use this at all, and a tag/link column can be
  added later without a breaking migration.
- **Real-time delivery via the existing SSE/Redis pub/sub pipeline** —
  rejected; that infrastructure exists to make the live offers feed feel
  live at offer-update frequency. Announcement posting volume doesn't come
  close to justifying it — a normal server-rendered page with on-publish
  revalidation is sufficient.

### Data model

New table, following `docs/data-model.md`'s existing conventions (UUID
primary keys, `createdAt`/`updatedAt`, Postgres enums for status):

```
announcements
  id               uuid pk
  supplierId       uuid fk -> suppliers.id, not null
  body             text not null                  -- free text, length-constrained (e.g. 1-500 chars)
  status           enum(PENDING, APPROVED, REJECTED) default PENDING
  rejectionReason  text nullable
  reviewedBy       text fk -> user.id, nullable
  reviewedAt       timestamp nullable
  publishedAt      timestamp nullable
  createdAt        timestamp
  updatedAt        timestamp
```

Indexes: `index(supplierId)`, `index(status)`, `index(publishedAt)`.

**`reviewedBy` is typed `text`, not `uuid`.** `docs/data-model.md` itself
still describes the auth table as `users` with a `uuid` id; per
`current.md`'s "Known Issues," that's stale — Better Auth actually
generated the table as `user` (singular) with a `text` primary key, and
every real FK in the codebase (e.g. `suppliers.userId`) already treats it
as `text`. This spec follows the real schema, not the stale doc.

Only suppliers with `suppliers.verified = true` may create a row —
unverified suppliers don't see a way to post. Raw submitted text is never
edited by the supplier or by admin after submission, mirroring this
codebase's existing immutability rule for broadcast text (`project_plan.md`
rule 8): a rejected post is resubmitted as a brand-new row, never patched
in place. This keeps every published announcement traceable to exactly
what its author wrote, with no silent rewriting by a reviewer.

### Workflow

```
Supplier (dashboard) → writes body text → row created, status = PENDING
Admin (admin panel)  → reviews pending queue → approves or rejects (+ optional reason)
APPROVED  → publishedAt set → visible on public /community feed, newest first
REJECTED  → visible only to the authoring supplier, with the reason
```

This intentionally mirrors the broadcast review pipeline's pending →
review → publish shape (Phase 6) rather than inventing a differently
shaped trust model for a second kind of supplier-submitted content.

### Routes / UI

- **`/community`** — new public, server-rendered page. Lists `APPROVED`
  announcements ordered by `publishedAt desc`. No SSE/realtime (see
  rejected alternatives above).
- **Submission** — a simple form inside the existing supplier
  `/dashboard`, alongside other self-service supplier actions.
- **Review queue** — a new section inside the existing `/admin` panel
  (Phase 13), reusing whichever list/approve/reject UI pattern the
  broadcast review screen (Phase 6) establishes, rather than building a
  second one-off queue.
- **Module** — a new `src/modules/announcements/` (`schema.ts`,
  `service.ts`, `queries.ts`), following the same shape as existing
  modules (e.g. `src/modules/offers/`, `src/modules/broadcasts/`).
- **Nav** — add `"Community"` to `NAV_ITEMS` in
  `src/components/layout/site-header.tsx` and to `PLATFORM_LINKS` in
  `site-footer.tsx`, with `href: null` at first — the same disabled
  "Coming soon" placeholder already used for `WTB` and `Insights`. This is
  implementation work for whoever picks up Phase 15, not part of this
  documentation pass.

### Naming

The public-facing label is **"Community"** (matches how the idea was
framed and how it'll be marketed); the underlying module/table is named
`announcements`, because that's the actual content type being stored.
"Community" stays a UI/nav label, not a vague catch-all abstraction in the
code.

### Roadmap placement

Proposed as **Phase 15**, after Phase 14 (Deployment) — see
`project_plan.md`. It hard-depends only on Phase 1 (auth — done), but
should wait until:

- **Phase 6** (broadcast review) exists, so its approve/reject UI pattern
  can be reused rather than duplicated.
- **Phase 13** (admin panel) exists, so the review queue has a real home
  instead of a one-off page built ahead of the panel that's meant to host
  it.

It sits outside the 21 MVP success criteria in `project_plan.md` — it
neither blocks nor is blocked by MVP completion.

## Open questions (deferred, not blocking)

- Exact max length for `body` (proposed 500 chars, unvalidated against
  real usage).
- Whether suppliers should be able to see their own pending posts in the
  dashboard before admin acts on them (likely yes, out of scope to detail
  here).
- Whether a tag/category column gets added once there's evidence of what
  suppliers actually post about.
