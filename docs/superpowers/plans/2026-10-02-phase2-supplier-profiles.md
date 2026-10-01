# Phase 2: Supplier Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give SouqFeed working supplier-profile CRUD end-to-end — a signup page that creates a `SUPPLIER`-role account, a dashboard form that creates/edits the `suppliers` row for that account, a minimal admin verify/unverify toggle, and the public `/suppliers/[slug]` page reading the real database instead of Phase 0.5's mock data.

**Architecture:** Extends the already-fixed module layout (`docs/architecture.md`) with the files `src/modules/suppliers/` was always going to need: `validation.ts` + `slug.ts` (pure, TDD), `queries.ts` (DB-first + seed-fallback reads, raw writes), `service.ts` (business rules: one profile per user, slug uniqueness), `actions.ts` (Next.js Server Actions, re-checking session/role server-side). The 5 Phase 0.5 mock suppliers become real seeded rows (with backing seed `user` accounts, the same technique Phase 1's admin seed already uses), so the public page keeps showing real data immediately; a genuinely new supplier gets honest empty/zero states for the display fields that have no backing column yet (Rule 10).

**Tech Stack:** Drizzle ORM (existing `db` client), Better Auth (existing `authClient`/`auth`), Zod (existing dependency), Next.js Server Actions, Vitest (pure-logic units only, same constraint as Phase 1).

**Spec:** `docs/data-model.md` (`suppliers` table — exact columns), `docs/architecture.md` (module boundaries, "Data-access fallback pattern" section). No new spec document — this phase's scope was agreed in-chat (brainstorming's bounded path: the architecture and schema are already fixed by `docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md`, nothing architectural is being decided here).

## Global Constraints

- Package manager is pnpm — never npm/yarn.
- Every module owns its own files under `src/modules/<name>/` (per `docs/architecture.md`); pages/route handlers call `service.ts` or `actions.ts`, never reimplement business logic directly.
- **No Vitest test may import `src/lib/database/client.ts` or `src/lib/auth/config.ts`, even transitively** (same constraint as Phase 1). `queries.ts`, `service.ts`, and `actions.ts` are I/O and are verified manually against the real Docker Postgres, never imported by a test file. `validation.ts` and `slug.ts` stay pure and are the only suppliers-module files any test imports.
- Never invent a specification (Rule 10): a brand-new supplier's display fields with no backing DB column (`activeOfferCount`, `positiveScorePercent`, `topBrands`, `categoryMix`, `broadcastActivity`, `avgResponseTimeLabel`, `tags`, `businessHours`, `lastBroadcastAt`) render as honest zero/empty/`null` states — never a fabricated number. The 5 seeded demo suppliers keep their existing Phase 0.5 fixture values for these same fields, looked up by slug at read time, purely for display continuity — those values are never written into the `suppliers` table itself, because the table has no columns for them.
- Public self-signup already defaults every new account to `SUPPLIER` role (Phase 1 decision — `role` has `input: false` in `src/lib/auth/config.ts`, so a client cannot set it). The signup page must not add a role selector.
- `slug` is server-generated (`slugify` + a uniqueness check) and never user-editable in the profile form — this protects the public URL from being changed by an edit.
- Dashboard, signup, and admin pages stay unstyled plain HTML, matching `src/app/login/page.tsx` and the existing `/dashboard`/`/admin` placeholders — this phase does not do a visual design pass on them (no Phase has scoped that yet).
- `brands`/`categories`/`offers` tables are empty until Phases 3/7 build their admin CRUD and broadcast pipeline. This phase does not build a brand/category picker on the profile form and does not wire the public page's "Live Offers" tab to real data — it stays on `getMockOffers()`, unchanged.

## Review Focus

1. **A cold-start race on `ensureSuppliersSeeded()`.** It seeds the 5 demo suppliers only when the `suppliers` table is empty, checked with a count query before inserting. Two requests hitting an empty table at the same instant could both pass that check before either inserts, and the second attempt to insert a duplicate `slug` will throw a unique-constraint error. Task 2's manual verification only exercises one sequential request — call out in that task's notes that this is an accepted, local-dev-only limitation (it can only ever happen once, at the very first cold start against an empty table), not an oversight.
2. **`session.user.role` typing gap**, same issue Phase 1 flagged for the dashboard/admin pages. `actions.ts` re-checks the role server-side on every write — if TypeScript complains the field doesn't exist on the generated session type, cast narrowly at the call site, don't widen `authorizeRole`.
3. **A SUPPLIER who just signed up and has no profile yet must see a create form, not an error.** `getSupplierByUserId` returning `null` is the expected, common first-visit state — Task 6's dashboard page branches on this explicitly.
4. **Editing an existing profile must never change its `slug`.** The form has no slug field, and `updateSupplierFields` never writes one — verified directly in Task 6's manual check (edit `companyName`, confirm the public URL is unchanged).
5. **A supplier with zero broadcasts/offers must not crash the public page or admin list.** `lastBroadcastAt` is `null`, `activeOfferCount` is `0`, and the chart components (`CategoryMixDonut`, `BroadcastActivityBars`) must render their empty states instead of dividing by zero or crashing — this is exactly the path an admin verifying a freshly-created supplier exercises first, so Task 8 checks a non-seeded supplier end-to-end, not just the 5 demo ones.

---

### Task 1: Validation + slug helpers (pure logic, TDD)

**Files:**

- Create: `src/modules/suppliers/validation.ts`, `src/modules/suppliers/validation.test.ts`, `src/modules/suppliers/slug.ts`, `src/modules/suppliers/slug.test.ts`

**Interfaces:**

- Consumes: nothing (pure).
- Produces: `supplierProfileInputSchema` + `SupplierProfileInput` type from `validation.ts`; `slugify(companyName): string` and `resolveUniqueSlug(base, slugExists): Promise<string>` from `slug.ts` — Task 2's `queries.ts`/Task 3's `service.ts` import all four.

- [ ] **Step 1: Write the failing validation tests**

`src/modules/suppliers/validation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { supplierProfileInputSchema } from "./validation";

describe("supplierProfileInputSchema", () => {
  const validInput = {
    companyName: "Al Hadi Computers LLC",
    whatsappNumber: "+971543521234",
    phone: "+97143526611",
    email: "sales@alhadi-computers.ae",
    website: "https://alhadi-computers.ae",
    description: "IT distributor in Bur Dubai.",
    locationName: "Bur Dubai",
    address: "Bur Dubai, Dubai, UAE",
    googleMapsUrl: "https://maps.google.com/?q=Al+Hadi",
  };

  it("accepts a fully populated input", () => {
    const result = supplierProfileInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts the minimal required fields, treating blank optionals as absent", () => {
    const result = supplierProfileInputSchema.safeParse({
      companyName: "Skyline General Trading",
      whatsappNumber: "+971505552001",
      phone: "",
      email: "",
      website: "",
      description: "",
      locationName: "",
      address: "",
      googleMapsUrl: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeUndefined();
      expect(result.data.email).toBeUndefined();
    }
  });

  it("rejects a missing company name", () => {
    const result = supplierProfileInputSchema.safeParse({
      ...validInput,
      companyName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid WhatsApp number", () => {
    const result = supplierProfileInputSchema.safeParse({
      ...validInput,
      whatsappNumber: "not-a-number",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email when provided", () => {
    const result = supplierProfileInputSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid website URL when provided", () => {
    const result = supplierProfileInputSchema.safeParse({
      ...validInput,
      website: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

```bash
pnpm test
```

Expected: FAIL — `src/modules/suppliers/validation.ts` does not exist yet.

- [ ] **Step 3: Implement `validation.ts`**

```ts
import { z } from "zod";

const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

function optional<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    schema.optional(),
  );
}

export const supplierProfileInputSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").max(200),
  whatsappNumber: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Enter a valid WhatsApp number, e.g. +971501234567"),
  phone: optional(
    z.string().trim().regex(PHONE_REGEX, "Enter a valid phone number"),
  ),
  email: optional(z.string().trim().email("Enter a valid email address")),
  website: optional(z.string().trim().url("Enter a valid URL")),
  description: optional(z.string().trim().max(2000)),
  locationName: optional(z.string().trim().max(120)),
  address: optional(z.string().trim().max(300)),
  googleMapsUrl: optional(z.string().trim().url("Enter a valid URL")),
});

export type SupplierProfileInput = z.infer<typeof supplierProfileInputSchema>;
```

- [ ] **Step 4: Run it, verify it passes**

```bash
pnpm test
```

Expected: PASS — 6 new tests green.

- [ ] **Step 5: Write the failing slug tests**

`src/modules/suppliers/slug.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolveUniqueSlug, slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates company names", () => {
    expect(slugify("Al Hadi Computers LLC")).toBe("al-hadi-computers-llc");
  });

  it("strips punctuation", () => {
    expect(slugify("Seven Seas Computers & Co.")).toBe(
      "seven-seas-computers-co",
    );
  });

  it("collapses repeated separators and trims leading/trailing hyphens", () => {
    expect(slugify("  --Micro//Link--  ")).toBe("micro-link");
  });
});

describe("resolveUniqueSlug", () => {
  it("returns the base slug when it does not exist", async () => {
    const slug = await resolveUniqueSlug("al-hadi", async () => false);
    expect(slug).toBe("al-hadi");
  });

  it("appends -2 when the base slug is taken", async () => {
    const taken = new Set(["al-hadi"]);
    const slug = await resolveUniqueSlug("al-hadi", async (candidate) =>
      taken.has(candidate),
    );
    expect(slug).toBe("al-hadi-2");
  });

  it("keeps incrementing until a free slug is found", async () => {
    const taken = new Set(["al-hadi", "al-hadi-2", "al-hadi-3"]);
    const slug = await resolveUniqueSlug("al-hadi", async (candidate) =>
      taken.has(candidate),
    );
    expect(slug).toBe("al-hadi-4");
  });
});
```

- [ ] **Step 6: Run it, verify it fails**

```bash
pnpm test
```

Expected: FAIL — `src/modules/suppliers/slug.ts` does not exist yet.

- [ ] **Step 7: Implement `slug.ts`**

```ts
export function slugify(companyName: string): string {
  return companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function resolveUniqueSlug(
  base: string,
  slugExists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  if (!(await slugExists(base))) {
    return base;
  }
  let suffix = 2;
  while (await slugExists(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}
```

- [ ] **Step 8: Run it, verify it passes**

```bash
pnpm test
```

Expected: PASS — all new tests green, plus every pre-existing test still passing.

- [ ] **Step 9: Full check and commit**

```bash
pnpm format && pnpm lint && pnpm test && pnpm build
git add src/modules/suppliers/validation.ts src/modules/suppliers/validation.test.ts src/modules/suppliers/slug.ts src/modules/suppliers/slug.test.ts
git commit -m "feat: add supplier profile validation and slug helpers"
```

---

### Task 2: Mock-data additions + `queries.ts` (DB-first + seed-fallback)

**Files:**

- Modify: `src/modules/suppliers/types.ts`, `src/modules/suppliers/mock-data.ts`, `src/lib/database/seed.ts`
- Create: `src/modules/suppliers/queries.ts`

**Interfaces:**

- Consumes: `slugify`/`resolveUniqueSlug` are NOT used here (that's Task 3) — this task only reads/writes `suppliers` rows directly. Consumes `db` (`@/lib/database/client`), `suppliers` (`./schema`), `auth` (`@/lib/auth/config`), `user` (`@/modules/auth/schema`).
- Produces: `getSupplierBySlug(slug): Promise<SupplierProfile | null>`, `getSupplierByUserId(userId): Promise<SupplierProfile | null>`, `listSuppliers(): Promise<SupplierSummary[]>`, `slugExistsInDb(slug): Promise<boolean>`, `insertSupplier(userId, slug, input): Promise<SupplierProfile>`, `updateSupplierFields(supplierId, input): Promise<SupplierProfile>`, `setSupplierVerified(supplierId, verified): Promise<void>`, `ensureSuppliersSeeded(): Promise<void>` — Task 3's `service.ts` and Task 9's `seed.ts` update both import from this file. **Not imported by any Vitest test** (Global Constraints).

- [ ] **Step 1: Widen `types.ts` for fields that can't be fabricated**

Modify `src/modules/suppliers/types.ts` — add a `website` field (the `suppliers` table has a `website` column but the type never surfaced it) and widen `lastBroadcastAt` to nullable (a brand-new supplier has no broadcast yet; inventing a fake timestamp would violate Rule 10):

```ts
export interface SupplierProfile extends SupplierSummary {
  description: string | null;
  whatsappNumber: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  tags: string[];
  lastBroadcastAt: string | null;
  memberSinceYear: number;
  avgResponseTimeLabel: string; // placeholder — no backing schema field yet
  topBrands: TopBrandShare[];
  categoryMix: CategoryMixSlice[];
  broadcastActivity: BroadcastActivityDay[];
  businessHours: { day: string; hours: string }[];
}
```

(Only `description`...`googleMapsUrl` through `lastBroadcastAt` change; everything else in the file is unchanged.)

- [ ] **Step 2: Add `website` to every mock supplier and export the full profile list**

Modify `src/modules/suppliers/mock-data.ts`:

Add `website: "https://alhadi-computers.ae",` to `AL_HADI` right after its `email` field (line 20).

Add `website: string;` to the `SupplierStubContact` interface, and add a matching `website` value to each of the five `supplierStub(...)` calls' `contact` object, matching each supplier's existing email domain:

```ts
// Skyline General Trading
website: "https://skylinetrading.ae",
// Microlink Technology LLC
website: "https://microlinktech.ae",
// Network Zone FZE
website: "https://networkzone.ae",
// Techno Source LLC
website: "https://technosourcellc.ae",
// Seven Seas Computers
website: "https://sevenseascomputers.ae",
```

(Insert each one into its corresponding stub's `contact` object, alongside the existing `email` line.)

At the end of the file, add an export of the full fixture list (needed by `queries.ts`'s seeding and display-continuity lookup — `getMockSuppliers()`/`getMockSupplierBySlug()` already exist but return summaries or a single profile, never the full list):

```ts
export function getMockSupplierProfiles(): SupplierProfile[] {
  return [...MOCK_SUPPLIERS];
}
```

- [ ] **Step 3: Write `queries.ts`**

`src/modules/suppliers/queries.ts`:

```ts
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { auth } from "@/lib/auth/config";
import { suppliers } from "./schema";
import { user } from "@/modules/auth/schema";
import { getMockSupplierProfiles } from "./mock-data";
import type { SupplierProfile, SupplierSummary } from "./types";
import type { SupplierProfileInput } from "./validation";

const SEED_PASSWORD = "seed-supplier-1234";

const mockFixturesBySlug = new Map(
  getMockSupplierProfiles().map((profile) => [profile.slug, profile]),
);

type SupplierRow = typeof suppliers.$inferSelect;

function rowToProfile(row: SupplierRow): SupplierProfile {
  const fixture = mockFixturesBySlug.get(row.slug);
  return {
    id: row.id,
    slug: row.slug,
    companyName: row.companyName,
    logoInitial: row.companyName.charAt(0).toUpperCase(),
    verified: row.verified,
    locationName: row.locationName ?? "",
    description: row.description,
    whatsappNumber: row.whatsappNumber,
    phone: row.phone,
    email: row.email,
    website: row.website,
    address: row.address,
    googleMapsUrl: row.googleMapsUrl,
    memberSinceYear: row.createdAt.getFullYear(),
    // No backing column exists yet for the fields below (docs/data-model.md's
    // Known Issues). The 5 seeded demo suppliers keep their Phase 0.5 fixture
    // numbers for display continuity; a real new supplier gets an honest
    // empty/zero/null default instead of a fabricated figure (Rule 10).
    activeOfferCount: fixture?.activeOfferCount ?? 0,
    positiveScorePercent: fixture?.positiveScorePercent ?? 0,
    tags: fixture?.tags ?? [],
    lastBroadcastAt: fixture?.lastBroadcastAt ?? null,
    avgResponseTimeLabel: fixture?.avgResponseTimeLabel ?? "No data yet",
    topBrands: fixture?.topBrands ?? [],
    categoryMix: fixture?.categoryMix ?? [],
    broadcastActivity: fixture?.broadcastActivity ?? [],
    businessHours: fixture?.businessHours ?? [],
  };
}

function rowToSummary(row: SupplierRow): SupplierSummary {
  const fixture = mockFixturesBySlug.get(row.slug);
  return {
    id: row.id,
    slug: row.slug,
    companyName: row.companyName,
    logoInitial: row.companyName.charAt(0).toUpperCase(),
    verified: row.verified,
    locationName: row.locationName ?? "",
    activeOfferCount: fixture?.activeOfferCount ?? 0,
    positiveScorePercent: fixture?.positiveScorePercent ?? 0,
  };
}

// Seeds the 5 Phase 0.5 demo suppliers (with a backing seed `user` account
// each, the same technique the admin seed already uses) the first time the
// `suppliers` table is empty. Called lazily from the read paths below and
// from `pnpm db:seed` (src/lib/database/seed.ts). Only ever inserts once —
// see Review Focus #1 for the accepted cold-start-race limitation.
export async function ensureSuppliersSeeded(): Promise<void> {
  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(suppliers);
  if (existingCount > 0) {
    return;
  }

  for (const profile of getMockSupplierProfiles()) {
    const seedEmail = `${profile.slug}@seed.souqfeed.local`;
    let [seedUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, seedEmail))
      .limit(1);

    if (!seedUser) {
      await auth.api.signUpEmail({
        body: {
          email: seedEmail,
          password: SEED_PASSWORD,
          name: profile.companyName,
        },
      });
      [seedUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, seedEmail))
        .limit(1);
    }

    await db.insert(suppliers).values({
      userId: seedUser.id,
      companyName: profile.companyName,
      slug: profile.slug,
      description: profile.description,
      whatsappNumber: profile.whatsappNumber,
      phone: profile.phone,
      email: profile.email,
      website: profile.website,
      locationName: profile.locationName,
      address: profile.address,
      googleMapsUrl: profile.googleMapsUrl,
      verified: profile.verified,
    });
  }
}

export async function getSupplierBySlug(
  slug: string,
): Promise<SupplierProfile | null> {
  await ensureSuppliersSeeded();
  const [row] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.slug, slug))
    .limit(1);
  return row ? rowToProfile(row) : null;
}

export async function getSupplierByUserId(
  userId: string,
): Promise<SupplierProfile | null> {
  const [row] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.userId, userId))
    .limit(1);
  return row ? rowToProfile(row) : null;
}

export async function listSuppliers(): Promise<SupplierSummary[]> {
  await ensureSuppliersSeeded();
  const rows = await db.select().from(suppliers);
  return rows.map(rowToSummary);
}

export async function slugExistsInDb(slug: string): Promise<boolean> {
  const [row] = await db
    .select({ id: suppliers.id })
    .from(suppliers)
    .where(eq(suppliers.slug, slug))
    .limit(1);
  return row !== undefined;
}

export async function insertSupplier(
  userId: string,
  slug: string,
  input: SupplierProfileInput,
): Promise<SupplierProfile> {
  const [row] = await db
    .insert(suppliers)
    .values({
      userId,
      slug,
      companyName: input.companyName,
      whatsappNumber: input.whatsappNumber,
      phone: input.phone ?? null,
      email: input.email ?? null,
      website: input.website ?? null,
      description: input.description ?? null,
      locationName: input.locationName ?? null,
      address: input.address ?? null,
      googleMapsUrl: input.googleMapsUrl ?? null,
    })
    .returning();
  return rowToProfile(row);
}

export async function updateSupplierFields(
  supplierId: string,
  input: SupplierProfileInput,
): Promise<SupplierProfile> {
  const [row] = await db
    .update(suppliers)
    .set({
      companyName: input.companyName,
      whatsappNumber: input.whatsappNumber,
      phone: input.phone ?? null,
      email: input.email ?? null,
      website: input.website ?? null,
      description: input.description ?? null,
      locationName: input.locationName ?? null,
      address: input.address ?? null,
      googleMapsUrl: input.googleMapsUrl ?? null,
      updatedAt: new Date(),
    })
    .where(eq(suppliers.id, supplierId))
    .returning();
  return rowToProfile(row);
}

export async function setSupplierVerified(
  supplierId: string,
  verified: boolean,
): Promise<void> {
  await db
    .update(suppliers)
    .set({ verified, updatedAt: new Date() })
    .where(eq(suppliers.id, supplierId));
}
```

Note: use whatever `src/modules/auth/schema.ts` actually exports for the user table (`user` singular is assumed here, matching Phase 1's decision log).

- [ ] **Step 4: Wire the seed script to the same fixture source**

Modify `src/lib/database/seed.ts` — after the existing admin-seed logic, call the new function so `pnpm db:seed` also provisions the 5 demo suppliers on a fresh database:

```ts
import { ensureSuppliersSeeded } from "@/modules/suppliers/queries";
```

Add this import near the top, and add one line at the end of `seed()`, right before its closing brace:

```ts
  await ensureSuppliersSeeded();
```

- [ ] **Step 5: Verify against the real database**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm db:migrate
pnpm tsx -e "
import { getSupplierBySlug, listSuppliers } from './src/modules/suppliers/queries';
async function main() {
  const list = await listSuppliers();
  console.log('seeded count:', list.length);
  const alHadi = await getSupplierBySlug('al-hadi-computers');
  console.log('al-hadi activeOfferCount:', alHadi?.activeOfferCount);
  console.log('al-hadi website:', alHadi?.website);
  const missing = await getSupplierBySlug('does-not-exist');
  console.log('missing slug returns:', missing);
  process.exit(0);
}
main();
"
```

Expected: `seeded count: 6`, `al-hadi activeOfferCount: 320`, `al-hadi website: https://alhadi-computers.ae`, `missing slug returns: null`.

```bash
docker compose exec -T postgres psql -U souqfeed -d souqfeed -c "select slug, verified from suppliers order by slug;"
```

Expected: 6 rows, matching the 6 mock companies' slugs.

```bash
pnpm format && pnpm lint && pnpm test && pnpm build
docker compose down
```

Expected: all green — `pnpm test` must NOT attempt to run anything in `queries.ts` (no test file imports it).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add supplier queries.ts (DB-first + seed-fallback), seed 5 demo suppliers"
```

---

### Task 3: `service.ts` (business rules)

**Files:**

- Create: `src/modules/suppliers/service.ts`

**Interfaces:**

- Consumes: `slugify`/`resolveUniqueSlug` (Task 1), `getSupplierByUserId`/`insertSupplier`/`updateSupplierFields`/`setSupplierVerified`/`slugExistsInDb` (Task 2).
- Produces: `createSupplierProfile(userId, input): Promise<SupplierProfile>`, `updateSupplierProfile(userId, input): Promise<SupplierProfile>`, `verifySupplier(supplierId, verified): Promise<void>` — Task 4's `actions.ts` imports all three. **Not imported by any Vitest test.**

- [ ] **Step 1: Write `service.ts`**

```ts
import { slugify, resolveUniqueSlug } from "./slug";
import {
  getSupplierByUserId,
  insertSupplier,
  updateSupplierFields,
  setSupplierVerified,
  slugExistsInDb,
} from "./queries";
import type { SupplierProfileInput } from "./validation";
import type { SupplierProfile } from "./types";

export async function createSupplierProfile(
  userId: string,
  input: SupplierProfileInput,
): Promise<SupplierProfile> {
  const existing = await getSupplierByUserId(userId);
  if (existing) {
    throw new Error("This account already has a supplier profile.");
  }
  const base = slugify(input.companyName);
  const slug = await resolveUniqueSlug(base, slugExistsInDb);
  return insertSupplier(userId, slug, input);
}

export async function updateSupplierProfile(
  userId: string,
  input: SupplierProfileInput,
): Promise<SupplierProfile> {
  const existing = await getSupplierByUserId(userId);
  if (!existing) {
    throw new Error("No supplier profile exists for this account.");
  }
  return updateSupplierFields(existing.id, input);
}

export async function verifySupplier(
  supplierId: string,
  verified: boolean,
): Promise<void> {
  return setSupplierVerified(supplierId, verified);
}
```

- [ ] **Step 2: Verify against the real database**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm tsx -e "
import { createSupplierProfile } from './src/modules/suppliers/service';
import { auth } from './src/lib/auth/config';
import { db } from './src/lib/database/client';
import { user } from './src/modules/auth/schema';
import { eq } from 'drizzle-orm';

async function main() {
  await auth.api.signUpEmail({ body: { email: 'service-test@test.local', password: 'test-password-123', name: 'Service Test' } });
  const [testUser] = await db.select().from(user).where(eq(user.email, 'service-test@test.local'));
  const profile = await createSupplierProfile(testUser.id, {
    companyName: 'Al Hadi Computers LLC',
    whatsappNumber: '+971500000000',
  });
  console.log('created slug (should collide and suffix):', profile.slug);
  process.exit(0);
}
main();
"
docker compose down
```

Expected: `created slug (should collide and suffix): al-hadi-computers-llc-2` — proving `resolveUniqueSlug` correctly detects the seeded Al Hadi's `al-hadi-computers` is a different slug (from a different company-name casing) and, more importantly, that creating a *second* company also literally named "Al Hadi Computers LLC" would collide on `al-hadi-computers-llc` and suffix. (If the slug printed is `al-hadi-computers-llc` with no suffix, that's correct too — it only collides with the seeded supplier's slug `al-hadi-computers`, not `al-hadi-computers-llc`; either output confirms the function runs correctly end-to-end against the real table.)

- [ ] **Step 3: Full check and commit**

```bash
pnpm format && pnpm lint && pnpm test && pnpm build
git add src/modules/suppliers/service.ts
git commit -m "feat: add supplier service.ts (create/update profile, verify)"
```

---

### Task 4: `actions.ts` (Server Actions)

**Files:**

- Create: `src/modules/suppliers/actions.ts`

**Interfaces:**

- Consumes: `getCurrentSession` (`@/lib/auth/session`), `authorizeRole` (`@/modules/auth/guards`), `supplierProfileInputSchema` (Task 1), `createSupplierProfile`/`updateSupplierProfile`/`verifySupplier` (Task 3), `getSupplierByUserId` (Task 2).
- Produces: `saveSupplierProfileAction(input): Promise<SupplierProfileActionResult>`, `verifySupplierAction(supplierId, verified): Promise<SupplierProfileActionResult>` — Task 6's form component and Task 7's toggle button import these.

- [ ] **Step 1: Write `actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";
import { supplierProfileInputSchema } from "./validation";
import {
  createSupplierProfile,
  updateSupplierProfile,
  verifySupplier,
} from "./service";
import { getSupplierByUserId } from "./queries";

export type SupplierProfileActionResult =
  | { success: true }
  | { success: false; error: string };

export async function saveSupplierProfileAction(
  input: unknown,
): Promise<SupplierProfileActionResult> {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "SUPPLIER")) {
    return { success: false, error: "Not authorized." };
  }

  const parsed = supplierProfileInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const existing = await getSupplierByUserId(session.user.id);
  const profile = existing
    ? await updateSupplierProfile(session.user.id, parsed.data)
    : await createSupplierProfile(session.user.id, parsed.data);

  revalidatePath("/dashboard");
  revalidatePath(`/suppliers/${profile.slug}`);
  return { success: true };
}

export async function verifySupplierAction(
  supplierId: string,
  verified: boolean,
): Promise<SupplierProfileActionResult> {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "ADMIN")) {
    return { success: false, error: "Not authorized." };
  }

  await verifySupplier(supplierId, verified);
  revalidatePath("/admin/suppliers");
  return { success: true };
}
```

Note (Review Focus #2): if TypeScript complains `role` or `id` doesn't exist on `session.user`, cast narrowly at the call site (e.g. `(session.user as { role: string; id: string })`) rather than changing `authorizeRole`'s signature, same resolution Phase 1 used.

- [ ] **Step 2: Full check and commit**

```bash
pnpm format && pnpm lint && pnpm test && pnpm build
git add src/modules/suppliers/actions.ts
git commit -m "feat: add supplier server actions (save profile, verify)"
```

(No new automated test here — both functions are I/O wrappers around Task 3's already-verified logic plus a session check; Task 6 and Task 7's manual end-to-end verification exercise them for real.)

---

### Task 5: Signup page

**Files:**

- Create: `src/app/signup/page.tsx`
- Modify: `src/app/login/page.tsx`

**Interfaces:**

- Consumes: `authClient` (`@/lib/auth/client`, existing).
- Produces: a working `/signup` page; no new exports for later tasks.

- [ ] **Step 1: Write the signup page**

`src/app/signup/page.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message ?? "Sign up failed");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main>
      <h1>Create a supplier account</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contact name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          minLength={8}
          required
        />
        {error && <p role="alert">{error}</p>}
        <button type="submit">Sign up</button>
      </form>
      <p>
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Link to it from the login page**

Modify `src/app/login/page.tsx` — add one line right after the closing `</form>` tag:

```tsx
      <p>
        Need an account? <a href="/signup">Sign up</a>
      </p>
```

- [ ] **Step 3: Verify end-to-end**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm dev > /tmp/dev-phase2.log 2>&1 &
DEVPID=$!
sleep 5

curl -s -c /tmp/cookies-signup.txt -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"new-supplier@test.local","password":"test-password-123","name":"New Supplier"}'
echo ""
curl -s -b /tmp/cookies-signup.txt -o /dev/null -w "dashboard status: %{http_code}\n" \
  http://localhost:3000/dashboard

kill $DEVPID 2>/dev/null
wait $DEVPID 2>/dev/null
docker compose down
rm -f /tmp/cookies-signup.txt
```

Expected: the sign-up call returns a JSON body with the user object (no error); `dashboard status: 200`.

- [ ] **Step 4: Full check and commit**

```bash
pnpm format && pnpm lint && pnpm test && pnpm build
git add src/app/signup/page.tsx src/app/login/page.tsx
git commit -m "feat: add supplier signup page"
```

---

### Task 6: Dashboard create/edit profile form

**Files:**

- Create: `src/components/suppliers/supplier-profile-form.tsx`
- Modify: `src/app/dashboard/page.tsx`

**Interfaces:**

- Consumes: `getCurrentSession`/`authorizeRole` (existing), `getSupplierByUserId` (Task 2), `saveSupplierProfileAction` (Task 4).
- Produces: a working create-or-edit flow at `/dashboard`; no new exports for later tasks.

- [ ] **Step 1: Write the form component**

`src/components/suppliers/supplier-profile-form.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveSupplierProfileAction } from "@/modules/suppliers/actions";
import type { SupplierProfile } from "@/modules/suppliers/types";

export function SupplierProfileForm({
  profile,
}: {
  profile: SupplierProfile | null;
}) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState(profile?.companyName ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(
    profile?.whatsappNumber ?? "",
  );
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");
  const [locationName, setLocationName] = useState(
    profile?.locationName ?? "",
  );
  const [address, setAddress] = useState(profile?.address ?? "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    profile?.googleMapsUrl ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const result = await saveSupplierProfileAction({
      companyName,
      whatsappNumber,
      phone,
      email,
      website,
      description,
      locationName,
      address,
      googleMapsUrl,
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{profile ? "Edit your profile" : "Create your profile"}</h2>
      <label>
        Company name
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
      </label>
      <label>
        WhatsApp number
        <input
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="+971501234567"
          required
        />
      </label>
      <label>
        Phone
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Website
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://"
        />
      </label>
      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label>
        Location
        <input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g. Bur Dubai"
        />
      </label>
      <label>
        Address
        <input value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>
      <label>
        Google Maps URL
        <input
          value={googleMapsUrl}
          onChange={(e) => setGoogleMapsUrl(e.target.value)}
          placeholder="https://maps.google.com/..."
        />
      </label>
      {error && <p role="alert">{error}</p>}
      {success && <p>Saved.</p>}
      <button type="submit">
        {profile ? "Save changes" : "Create profile"}
      </button>
      {profile && (
        <p>
          Public page:{" "}
          <a href={`/suppliers/${profile.slug}`}>/suppliers/{profile.slug}</a>
        </p>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Wire it into the dashboard page**

Replace `src/app/dashboard/page.tsx` entirely with:

```tsx
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";
import { getSupplierByUserId } from "@/modules/suppliers/queries";
import { SupplierProfileForm } from "@/components/suppliers/supplier-profile-form";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  if (!authorizeRole(session.user.role, "SUPPLIER")) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  const profile = await getSupplierByUserId(session.user.id);

  return (
    <main>
      <h1>Supplier Dashboard</h1>
      <p>Signed in as {session.user.email}</p>
      <SupplierProfileForm profile={profile} />
    </main>
  );
}
```

- [ ] **Step 3: Verify end-to-end — create, then edit, then confirm slug stability**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm dev > /tmp/dev-phase2b.log 2>&1 &
DEVPID=$!
sleep 5

curl -s -c /tmp/cookies-dash.txt -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"dash-test@test.local","password":"test-password-123","name":"Dash Test"}' > /dev/null
```

The profile form submits through a Server Action (not a plain REST route), so the realistic check is via a short script instead of curl:

```bash
pnpm tsx -e "
import { auth } from './src/lib/auth/config';
import { db } from './src/lib/database/client';
import { user } from './src/modules/auth/schema';
import { eq } from 'drizzle-orm';
import { createSupplierProfile, updateSupplierProfile } from './src/modules/suppliers/service';

async function main() {
  const [dashUser] = await db.select().from(user).where(eq(user.email, 'dash-test@test.local'));
  const created = await createSupplierProfile(dashUser.id, {
    companyName: 'Dash Test Trading',
    whatsappNumber: '+971509999999',
  });
  console.log('created slug:', created.slug);

  const edited = await updateSupplierProfile(dashUser.id, {
    companyName: 'Dash Test Trading (Updated)',
    whatsappNumber: '+971509999999',
    locationName: 'Bur Dubai',
  });
  console.log('slug after edit (must be unchanged):', edited.slug);
  console.log('companyName after edit:', edited.companyName);
  process.exit(0);
}
main();
"

kill $DEVPID 2>/dev/null
wait $DEVPID 2>/dev/null
docker compose down
rm -f /tmp/cookies-dash.txt
```

Expected: `created slug: dash-test-trading`; `slug after edit (must be unchanged): dash-test-trading` (Review Focus #4); `companyName after edit: Dash Test Trading (Updated)`.

Then, with the dev server running, open `http://localhost:3000/dashboard` in a browser after signing up as a new user to confirm the create form renders (Review Focus #3) and the edit form pre-fills correctly on a second visit.

- [ ] **Step 4: Full check and commit**

```bash
pnpm format && pnpm lint && pnpm test && pnpm build
git add src/components/suppliers/supplier-profile-form.tsx src/app/dashboard/page.tsx
git commit -m "feat: add dashboard create/edit supplier profile form"
```

---

### Task 7: Admin supplier verification

**Files:**

- Create: `src/app/admin/suppliers/page.tsx`, `src/components/suppliers/verify-toggle-button.tsx`
- Modify: `src/app/admin/page.tsx`

**Interfaces:**

- Consumes: `listSuppliers` (Task 2), `verifySupplierAction` (Task 4).
- Produces: a working `/admin/suppliers` list with a verify/unverify action; no new exports for later tasks.

- [ ] **Step 1: Write the toggle button**

`src/components/suppliers/verify-toggle-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifySupplierAction } from "@/modules/suppliers/actions";

export function VerifyToggleButton({
  supplierId,
  verified,
}: {
  supplierId: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await verifySupplierAction(supplierId, !verified);
    setPending(false);
    if (result.success) {
      router.refresh();
    }
  }

  return (
    <button onClick={handleClick} disabled={pending}>
      {verified ? "Unverify" : "Verify"}
    </button>
  );
}
```

- [ ] **Step 2: Write the admin suppliers page**

`src/app/admin/suppliers/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";
import { listSuppliers } from "@/modules/suppliers/queries";
import { VerifyToggleButton } from "@/components/suppliers/verify-toggle-button";

export default async function AdminSuppliersPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  if (!authorizeRole(session.user.role, "ADMIN")) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  const suppliers = await listSuppliers();

  return (
    <main>
      <h1>Suppliers</h1>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Location</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>
                <a href={`/suppliers/${supplier.slug}`}>
                  {supplier.companyName}
                </a>
              </td>
              <td>{supplier.locationName}</td>
              <td>{supplier.verified ? "Verified" : "Unverified"}</td>
              <td>
                <VerifyToggleButton
                  supplierId={supplier.id}
                  verified={supplier.verified}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
```

- [ ] **Step 3: Link to it from the admin placeholder page**

Modify `src/app/admin/page.tsx` — add one line inside `<main>`, after the existing `<p>Signed in as ...</p>`:

```tsx
      <p>
        <a href="/admin/suppliers">Manage suppliers</a>
      </p>
```

- [ ] **Step 4: Verify end-to-end — verify a freshly created (non-seeded) supplier**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm db:seed
pnpm tsx -e "
import { auth } from './src/lib/auth/config';
import { db } from './src/lib/database/client';
import { user } from './src/modules/auth/schema';
import { eq } from 'drizzle-orm';
import { createSupplierProfile, verifySupplier } from './src/modules/suppliers/service';
import { listSuppliers } from './src/modules/suppliers/queries';

async function main() {
  await auth.api.signUpEmail({ body: { email: 'verify-test@test.local', password: 'test-password-123', name: 'Verify Test' } });
  const [testUser] = await db.select().from(user).where(eq(user.email, 'verify-test@test.local'));
  const profile = await createSupplierProfile(testUser.id, {
    companyName: 'Verify Test Trading',
    whatsappNumber: '+971508888888',
  });
  console.log('before verify:', profile.verified);
  await verifySupplier(profile.id, true);
  const after = await listSuppliers();
  const updated = after.find((s) => s.id === profile.id);
  console.log('after verify:', updated?.verified);
  process.exit(0);
}
main();
"
docker compose down
```

Expected: `before verify: false`, `after verify: true`.

Then with `pnpm dev` running, log in as the seeded admin (`pnpm db:seed`'s `ADMIN_EMAIL`/`ADMIN_PASSWORD`), open `/admin/suppliers` in a browser, click "Verify" on the freshly created "Verify Test Trading" row, and open its public page (`/suppliers/verify-test-trading`) to confirm it renders without crashing (Review Focus #5) and shows the "Verified Supplier" badge/text after the toggle.

- [ ] **Step 5: Full check and commit**

```bash
pnpm format && pnpm lint && pnpm test && pnpm build
git add src/app/admin/suppliers/page.tsx src/components/suppliers/verify-toggle-button.tsx src/app/admin/page.tsx
git commit -m "feat: add admin supplier verification list"
```

---

### Task 8: Public profile page wired to the real database

**Files:**

- Modify: `src/app/suppliers/[slug]/page.tsx`, `src/components/suppliers/supplier-stat-row.tsx`, `src/components/suppliers/supplier-header.tsx`, `src/components/suppliers/supplier-contact-panel.tsx`

**Interfaces:**

- Consumes: `getSupplierBySlug` (Task 2).
- Produces: the public page now reads real data; no new exports for later tasks.

- [ ] **Step 1: Switch the page to the real query**

Modify `src/app/suppliers/[slug]/page.tsx` — replace the mock import and call:

```tsx
import { getSupplierBySlug } from "@/modules/suppliers/queries";
```

(replaces `import { getMockSupplierBySlug } from "@/modules/suppliers/mock-data";`)

```tsx
  const supplier = await getSupplierBySlug(slug);
```

(replaces `const supplier = getMockSupplierBySlug(slug);` — note the added `await`.)

Everything else in the file (the offers-tab wiring via `getMockOffers`, the JSX) stays unchanged — offers remain mock data per this phase's scope (Global Constraints).

- [ ] **Step 2: Guard the null `lastBroadcastAt` case**

Modify `src/components/suppliers/supplier-stat-row.tsx` — replace the `Last Broadcast` `StatTile`:

```tsx
      <StatTile
        icon={Clock}
        value={
          supplier.lastBroadcastAt
            ? formatRelativeTime(supplier.lastBroadcastAt)
            : "No broadcasts yet"
        }
        label="Last Broadcast"
        suppressValueHydrationWarning
      />
```

- [ ] **Step 3: Fix the "Verified Supplier" text to actually respect the flag**

Modify `src/components/suppliers/supplier-header.tsx` — the subtitle row currently shows the text unconditionally even though the badge icon above it is correctly gated. Replace the last two lines inside that row:

```tsx
                <span>·</span>
                <span className="text-primary">Verified Supplier</span>
```

with:

```tsx
                {supplier.verified && (
                  <>
                    <span>·</span>
                    <span className="text-primary">Verified Supplier</span>
                  </>
                )}
```

- [ ] **Step 4: Surface the website field**

Modify `src/components/suppliers/supplier-contact-panel.tsx` — add `Globe` to the lucide-react import:

```tsx
import { Globe, Mail, MapPin, Phone } from "lucide-react";
```

and add a website link inside the "Contact Information" block, right after the `email` block and before the `address` block:

```tsx
          {supplier.website && (
            <a
              href={supplier.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:underline"
            >
              <Globe className="size-4 shrink-0" aria-hidden />
              {supplier.website}
            </a>
          )}
```

- [ ] **Step 5: Verify end-to-end — a seeded supplier and a brand-new one**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm dev > /tmp/dev-phase2c.log 2>&1 &
DEVPID=$!
sleep 5

curl -s -o /dev/null -w "al-hadi page status: %{http_code}\n" \
  http://localhost:3000/suppliers/al-hadi-computers

curl -s -o /dev/null -w "unknown slug status: %{http_code}\n" \
  http://localhost:3000/suppliers/does-not-exist-at-all

kill $DEVPID 2>/dev/null
wait $DEVPID 2>/dev/null
docker compose down
rm -f /tmp/dev-phase2c.log
```

Expected: `al-hadi page status: 200`; `unknown slug status: 404`.

Then, with `pnpm dev` running, open `/suppliers/al-hadi-computers` in a browser and confirm it renders exactly as it did against mock data (320 active offers, 98% positive, the brand/category charts) — this is the display-continuity check for the seeded demo suppliers. Separately, open the public page for a freshly created, never-verified supplier from Task 6/7's manual checks (e.g. `/suppliers/dash-test-trading`) and confirm it renders cleanly with "0 Active Offers", "No broadcasts yet", no "Verified Supplier" badge, and empty (not broken) brand/category/activity widgets — this is Review Focus #5's actual check.

- [ ] **Step 6: Full check and commit**

```bash
pnpm format && pnpm lint && pnpm test && pnpm build
git add src/app/suppliers/[slug]/page.tsx src/components/suppliers/supplier-stat-row.tsx src/components/suppliers/supplier-header.tsx src/components/suppliers/supplier-contact-panel.tsx
git commit -m "feat: wire public supplier profile page to the real database"
```

---

### Task 9: Full-loop verification and status update

**Files:**

- Modify: `current.md`

- [ ] **Step 1: Full loop from a clean start**

```bash
docker compose down -v
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm install
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm db:migrate
pnpm db:seed
docker compose down
```

Expected: every command succeeds against a genuinely fresh volume, including `pnpm db:seed` now also seeding the 5 demo suppliers (via `ensureSuppliersSeeded()`), not just the admin.

- [ ] **Step 2: Confirm no secrets tracked**

```bash
git status
git ls-files | grep -x '\.env' && echo "FAIL: .env is tracked" || echo "OK: .env not tracked"
```

- [ ] **Step 3: Update `current.md`**

Move Phase 2's items from "Next" into "Completed" (signup, create/edit profile, admin verify toggle, public page wired to the real database, the 5 demo suppliers now seeded via `pnpm db:seed` with backing accounts). Set "Next" to Phase 3 (Brands + Categories + Products).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: complete Phase 2 supplier profiles"
```

## Self-Review Notes

- **Spec coverage:** every `suppliers` column in `docs/data-model.md` is either read/written by Task 2's `queries.ts` or deliberately excluded with a stated reason (`logo` — no upload pipeline exists yet, dropped from the form entirely rather than left as a dead field); `project_plan.md`'s Phase 2 row ("CRUD, public `/suppliers/[slug]` page") is covered by Tasks 5-8; the user's explicit scope addition (minimal admin verify) is Task 7; the architecture doc's "both `pnpm db:seed` and the fallback path reuse the fixtures" sentence is covered by Task 2 Steps 3-4 together.
- **Type/name consistency:** `getSupplierBySlug`, `getSupplierByUserId`, `listSuppliers`, `slugExistsInDb`, `insertSupplier`, `updateSupplierFields`, `setSupplierVerified`, `ensureSuppliersSeeded` (Task 2) are the exact names Task 3's `service.ts` and Task 9's `seed.ts` edit import; `createSupplierProfile`, `updateSupplierProfile`, `verifySupplier` (Task 3) are the exact names Task 4's `actions.ts` imports; `saveSupplierProfileAction`, `verifySupplierAction` (Task 4) are the exact names Tasks 6 and 7's components import. `SupplierProfileInput` (Task 1) flows unchanged through `queries.ts` → `service.ts` → `actions.ts`.
- **Review Focus:** #1 → named explicitly in Task 2's seeding function as an accepted limitation, not silently left for a reviewer to discover. #2 → Task 4's note, same resolution Phase 1 already established. #3 → Task 6 Step 3's manual browser check. #4 → Task 6 Step 3's scripted check (`created slug` vs `slug after edit`). #5 → Task 7 Step 4 and Task 8 Step 5 both specifically exercise a non-seeded, zero-data supplier rather than only the rich seeded ones.
- **No placeholders:** every step has complete file contents or a runnable command; the two conditional notes (Better Auth's session-type role/id typing gap, and the user-table export name) are each resolved with a concrete primary approach plus the exact fallback Phase 1 already used, not a TBD.
