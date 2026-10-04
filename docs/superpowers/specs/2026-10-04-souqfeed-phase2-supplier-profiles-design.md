# SouqFeed — Phase 2: Supplier Profiles Design

## Problem

Phase 0.5 built the public Live Market homepage and `/suppliers/[slug]` page
against static mock data (`src/modules/suppliers/mock-data.ts`). Phase 1
built the real `suppliers` schema, Better Auth, and role guards, but nothing
reads or writes that table yet — `/dashboard` and `/admin` are bare
placeholders, and the public pages still call `getMockSuppliers()` /
`getMockSupplierBySlug()` directly.

Per `project_plan.md`, Phase 2 is "Supplier profiles (CRUD, public
`/suppliers/[slug]` page)." That means: make the public page real, let a
supplier self-service edit their own profile from `/dashboard`, and give
admins a way to verify/activate suppliers from `/admin`.

None of this is as mechanical as "wire the mock module to a real query."
Several things are genuinely unspecified and had to be decided here rather
than inferred from the schema:

- Several fields the public page displays
  (`topBrands`, `categoryMix`, `broadcastActivity`, `activeOfferCount`,
  `tags`, `memberSinceYear`, `lastBroadcastAt`, `positiveScorePercent`) have
  no backing column anywhere — they depend on Brands/Categories (Phase 3),
  Broadcasts (Phase 4), and Offers (Phase 7).
- The schema's `verified`/`active` booleans have no stated owner — nothing
  says whether a supplier's own edit form can touch them.
- `slug` is the public URL; nothing says whether it's supplier-editable.
- `supplier_brands`/`supplier_categories` join tables exist, but admin CRUD
  for the brands/categories they reference is Phase 3, not yet built.
- Nothing creates a `suppliers` row at signup — a freshly self-signed-up
  SUPPLIER has a `user` row and no `suppliers` row at all.
- Applying the documented DB-first/seed-fallback pattern
  (`docs/architecture.md`) to suppliers hits a wrinkle plain seeding doesn't:
  `suppliers.userId` is `NOT NULL UNIQUE` FK to `user`, so seeding the six
  mock suppliers into the real table also requires a matching `user` row
  per supplier.

## Decisions

### Placeholder fields stay seed-sourced, identity fields go real

`SupplierProfile`'s schema-backed fields (`companyName`, `logo`,
`description`, `whatsappNumber`, `phone`, `email`, `website`,
`locationName`, `address`, `googleMapsUrl`, `verified`, `active`, plus brand
and category associations) become real DB-backed reads in this phase.

The fields marked `// placeholder — no backing schema field yet` in
`src/modules/suppliers/types.ts` (`topBrands`, `categoryMix`,
`broadcastActivity`, `activeOfferCount`, `tags`, `memberSinceYear`,
`lastBroadcastAt`, `positiveScorePercent`) keep coming from
`mock-data.ts` as a seed/fallback source — not hidden, not faked further —
until Phases 3/4/7 build the tables that actually produce them. This is the
same DB-first/seed-fallback pattern already documented, just scoped
per-field rather than per-module: a supplier row can be partly real
(identity, contact, status) and partly seed-sourced (activity metrics) at
the same time, inside the same query result.

### `verified` and `active` are admin-only, always

The self-service `SupplierProfileForm` never includes `verified` or
`active` as form inputs, regardless of what else the supplier edits. They
render as read-only status badges on the dashboard. Only the admin
verification workflow can change them. No auto-reset-on-edit behavior —
editing other fields never touches these two.

### `slug` is immutable after creation

Generated once at profile-creation time from `companyName` (slugified, with
a numeric suffix on collision against the existing `unique(slug)`
constraint) and never exposed as an editable field afterward, by supplier
or admin. Nothing in this phase needs slug changes; adding that path now
would be speculative.

### Supplier can self-select brands/categories from existing seeded rows

`supplier_brands`/`supplier_categories` are part of the self-service edit
form (multi-select checkboxes), reading from `brands`/`categories` tables
seeded from their own `mock-data.ts` (same seed-fallback pattern,
applied here with no FK wrinkle since those tables don't reference `user`).
Creating, renaming, or deleting the canonical brand/category records
themselves stays out of scope — that is Phase 3's "admin CRUD, canonical
product model." This phase only lets a supplier associate to what already
exists.

### `active = false` hides the public profile; `verified = false` does not

`active` governs public visibility: `listSuppliers`'s public-facing query
(homepage, search) excludes `active = false` rows, and
`getSupplierBySlug` returns not-found for one, matching the existing
Phase 1 decision that `active` is the suspension flag. `verified = false`
does not hide anything — the supplier's profile stays visible, just
without the verified badge — because Phase 1 already decided self-signup
grants dashboard access with no approval gate; verification is a trust
signal layered on top, not a visibility gate.

### Admin scope: supplier list + verified/active toggles

`/admin` renders a table of all suppliers (company name, status badges,
toggle controls for `verified` and `active`). No review notes, audit trail,
or bulk actions — those aren't asked for by anything in `current.md` or
`project_plan.md`, and adding them now would be unrequested scope.

### Profile creation is a mode of the same form, not a signup hook

`/dashboard` looks up the supplier row by `session.user.id`. If none exists,
it renders `SupplierProfileForm` in `create` mode (first submission does an
`INSERT`, generates the slug, sets `verified = false`/`active = true` via
column defaults); if one exists, the same component renders in `edit` mode
(`UPDATE`, slug and admin-owned fields excluded from the form entirely).
This stays inside the suppliers module — no hook into Better Auth's signup
flow, no change to the auth module's boundaries.

### Seeding wrinkle: placeholder `user` rows per demo supplier

The suppliers seed step (triggered by `queries.ts`'s DB-first/seed-fallback
check, same as `pnpm db:seed` for the admin user) creates, for each of the
six `mock-data.ts` suppliers, one `user` row first (role `SUPPLIER`, email
like `al-hadi-computers@seed.souqfeed.internal`, a random unusable
password — nobody is meant to log in as these) and then the `suppliers` row
referencing it. This keeps the `userId NOT NULL UNIQUE` FK honest rather
than loosening a constraint the project chose deliberately (rule 7: prefer
database constraints over application-level assumptions). These seeded
rows are indistinguishable from a real supplier's row once created — they
exist purely so the public live feed/search/profile pages have real data to
query from day one, the same reason Phase 0.5's mock data existed.

### Module shape: this phase instantiates the pattern `docs/architecture.md` already named

`src/modules/suppliers/` gains `validation.ts`, `service.ts`, `queries.ts`,
`actions.ts` — the shape the module-boundary diagram already specifies but
no module has built yet:

- **`validation.ts`** — Zod schemas for create/update input, matching the
  real `NOT NULL` constraints (`companyName`, `whatsappNumber` required;
  everything else optional). No new dependency — Zod is already used in
  `src/lib/validation/env.ts`.
- **`service.ts`** — business logic: `createOwnProfile`/`updateOwnProfile`
  (both scoped by the caller's `userId`, never by a client-supplied
  supplier id, so a supplier can never touch another supplier's row),
  `setVerified`/`setActive` (admin-only callers), slug generation.
- **`queries.ts`** — DB-first/seed-fallback reads: `getSupplierBySlug`,
  `getSupplierByUserId`, `listSuppliers` (public callers get the
  `active = true` filter applied; the admin caller gets every row,
  active or not, since managing inactive/unverified suppliers is the
  point of the admin view).
- **`actions.ts`** — Server Actions (`updateOwnSupplierProfile`,
  `createOwnSupplierProfile`, `adminSetVerified`, `adminSetActive`), each
  re-checking `getCurrentSession()` + `authorizeRole()` server-side even
  though the calling page is already guarded — the same defense-in-depth
  the proxy/page two-layer guard already established in Phase 1.

`src/modules/{brands,categories}/` each gain a minimal `queries.ts`
(list-all, same seed-fallback pattern) solely to populate the multi-select
options. No admin management surface for brands/categories — that's Phase 3.

### Forms: native Server Actions, no new form library

`SupplierProfileForm` uses a plain `<form action={...}>` /
`useActionState`, not `react-hook-form` — Next.js's native pattern handles
progressive enhancement and pending/error state without a new dependency
(rule 6: no new library without a real current problem it solves). Two new
shadcn primitives are needed (`textarea` for the description field,
`table` for the admin list) — both generated component code, not new npm
packages.

### Missing sign-out is in scope for this phase

Nothing in the app can currently sign out — `src/lib/auth/client.ts` only
exports `authClient`, and no page calls `authClient.signOut()`. This
phase's pages (`/dashboard`, `/admin`) are the first real authenticated
surfaces a user actually spends time on, so a minimal sign-out control
belongs here rather than as a separate follow-up — the same way a good
developer fixes a gap they find in the code they're already working in,
without turning it into unrelated scope.

## Data flow

**Public read** (`/suppliers/[slug]`, homepage): `queries.ts` → DB (seed if
empty) → merge schema-backed fields with `mock-data.ts`-sourced
placeholder fields → render. No session required.

**Supplier edit**: session → `getSupplierByUserId` → form (create or edit
mode) → submit → Server Action re-checks session/role → Zod validates →
`service.ts` scopes the write to the caller's own `userId` → `queries.ts`
writes the `suppliers` row and replaces the `supplier_brands`/
`supplier_categories` join rows → `revalidatePath` on `/dashboard` and the
public `/suppliers/[slug]` → success state back to the form.

**Admin verification**: session (role `ADMIN`) → `listSuppliers` → table →
toggle click → Server Action re-checks role → `service.ts` → `queries.ts`
updates `verified`/`active` → `revalidatePath` on `/admin` and the affected
`/suppliers/[slug]`.

## Error handling

- Zod validation failures surface as field-level messages via
  `useActionState`, not a generic error banner.
- Ownership is enforced server-side in `service.ts`, which always derives
  the target row from the session's `userId` for the self-service path —
  the client never supplies a supplier id that could be swapped for
  someone else's.
- Every admin action re-verifies `authorizeRole(role, "ADMIN")` inside the
  Server Action itself, not just at the page level.
- Slug collisions during creation are handled by appending a numeric
  suffix and retrying, not by surfacing a raw unique-constraint error to
  the supplier.

## Testing

- Vitest for `validation.ts` (schema edge cases: missing required fields,
  malformed URLs/phone numbers) and the pure parts of `service.ts`
  (ownership scoping, slug slugification/collision logic) — these don't
  need a database to be correct.
- `queries.ts` and the full create/edit/admin-toggle flows are verified
  end-to-end against a real Docker Postgres instance (same approach Phase
  1 used for its I/O-heavy parts), including a genuinely empty database to
  confirm the seed step runs correctly.
- A manual `pnpm dev` browser pass: sign up as a new supplier (no profile
  yet → create form), edit an existing profile, verify the public page
  reflects changes, toggle verified/active as admin and confirm the public
  badge updates.

## Out of scope

- Brand/category admin CRUD (creating, renaming, deleting canonical
  records) — Phase 3.
- `topBrands`, `categoryMix`, `broadcastActivity`, `activeOfferCount`,
  `tags`, `memberSinceYear`, `lastBroadcastAt`, `positiveScorePercent`
  becoming real — Phases 3/4/7 respectively.
- Slug editing, by supplier or admin.
- Admin review notes, audit trail, or bulk verification actions.
- Deleting a supplier profile (no requirement for it; `active = false`
  covers deactivation).
- Password reset, email verification, or any other auth-flow change
  beyond adding a sign-out control.
