# Phase 2: Supplier Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make supplier profiles real — self-service CRUD from `/dashboard`,
a real public `/suppliers/[slug]` page, and an admin verification/activation
workflow from `/admin` — replacing the three bare placeholders Phase 1 left
behind.

**Architecture:** Instantiate the `validation.ts`/`service.ts`/`queries.ts`/
`actions.ts` module shape `docs/architecture.md` already specifies for
`src/modules/suppliers/`, following the DB-first/seed-fallback pattern
per-field (real identity/contact fields from Postgres, still-unbuilt
activity-metric fields from `mock-data.ts`) rather than per-module. Writes
go through Next.js Server Actions, scoped server-side to the caller's own
session `userId`; the admin surface gets its own re-checked Server Actions
for `verified`/`active`.

**Tech Stack:** Next.js 16 App Router (Server Actions, `useActionState`),
Drizzle ORM/Postgres, Zod (already a dependency), `@base-ui/react` via
shadcn (`textarea`, `table` primitives added this phase), Vitest.

**Spec:** `docs/superpowers/specs/2026-10-04-souqfeed-phase2-supplier-profiles-design.md`

## Global Constraints

- `verified` and `active` are never fields in the self-service form, under
  any circumstances — admin-only, always (spec: "`verified` and `active`
  are admin-only, always").
- `slug` is generated once at creation and never exposed as editable, by
  supplier or admin (spec: "`slug` is immutable after creation").
- Fields with no backing schema column (`topBrands`, `categoryMix`,
  `broadcastActivity`, `activeOfferCount`, `tags`, `memberSinceYear`,
  `lastBroadcastAt`, `avgResponseTimeLabel`, `positiveScorePercent`,
  `businessHours`, and a seed-sourced `logoInitial` fallback) stay
  seed/mock-sourced — zero-stated (empty array / `0` / `"—"`) for a real
  supplier with no matching mock entry, never invented differently.
- No new npm dependencies. Forms use native `<form action>` +
  `useActionState`, not `react-hook-form`. `textarea`/`table` are
  shadcn-generated component code, not packages.
- Every write path scopes by the caller's own session `userId` server-side;
  no function in `service.ts`'s self-service path accepts a
  client-supplied supplier id.
- Every admin action re-checks `authorizeRole(role, "ADMIN")` inside the
  Server Action itself, not just at the page level (same defense-in-depth
  Phase 1 established for pages).
- `active = false` is excluded from every public-facing read
  (`getSupplierBySlug` returns `undefined`, listings omit the row).
  `verified = false` stays publicly visible.

## Review Focus

- A supplier's own form submission can never set `verified`/`active` —
  `actions.ts`'s form-parsing function must not read those keys at all,
  structurally, not just "ignore" them. → Task 7.
- `updateOwnSupplierProfile` must only ever touch the row belonging to the
  calling session's `userId`, even if two suppliers exist — never a
  client-suppliable id. → Task 6 (live, two-supplier isolation check).
- Two suppliers creating profiles with the same/similar company name must
  get distinct slugs via a numeric suffix, not a crash or silent
  overwrite. → Task 1 (unit) and Task 4/12 (live, real collision).
- An inactive (`active = false`) supplier's public profile must actually
  disappear (`getSupplierBySlug` → `undefined` → `notFound()`), not just
  look hidden in the UI. → Task 4 (live) and Task 11.
- Seeding from a genuinely empty database must create valid
  `user` + `suppliers` row pairs (FK-satisfying) without partial rows if
  something fails midway, and must be idempotent (safe to run twice). →
  Task 4 (live) and Task 12 (fresh-volume full loop).

---

### Task 1: Slug generation (pure, TDD)

**Files:**

- Create: `src/modules/suppliers/slug.ts`
- Test: `src/modules/suppliers/slug.test.ts`

**Interfaces:**

- Consumes: nothing (pure).
- Produces: `slugify(input: string): string`, `resolveUniqueSlug(base: string, isTaken: (candidate: string) => Promise<boolean>): Promise<string>` — Task 6's `service.ts` calls both.

- [ ] **Step 1: Write the failing tests**

`src/modules/suppliers/slug.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolveUniqueSlug, slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates company names", () => {
    expect(slugify("Al Hadi Computers LLC")).toBe("al-hadi-computers-llc");
  });

  it("strips characters that aren't letters, numbers, or spaces", () => {
    expect(slugify("Tech & Co. (Dubai)")).toBe("tech-co-dubai");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  -Extra Spaces-  ")).toBe("extra-spaces");
  });
});

describe("resolveUniqueSlug", () => {
  it("returns the base slug when it's not taken", async () => {
    const slug = await resolveUniqueSlug("New Supplier", async () => false);
    expect(slug).toBe("new-supplier");
  });

  it("appends a numeric suffix on collision, retrying until free", async () => {
    const taken = new Set(["popular-name", "popular-name-2"]);
    const slug = await resolveUniqueSlug("Popular Name", async (candidate) =>
      taken.has(candidate),
    );
    expect(slug).toBe("popular-name-3");
  });

  it("falls back to a generic root when the name has no usable characters", async () => {
    const slug = await resolveUniqueSlug("!!!", async () => false);
    expect(slug).toBe("supplier");
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
pnpm test slug
```

Expected: FAIL — `./slug` doesn't exist yet.

- [ ] **Step 3: Implement**

`src/modules/suppliers/slug.ts`:

```ts
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function resolveUniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "supplier";
  let candidate = root;
  let suffix = 2;
  while (await isTaken(candidate)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
pnpm test slug
```

Expected: PASS — 6/6.

- [ ] **Step 5: Commit**

```bash
git add src/modules/suppliers/slug.ts src/modules/suppliers/slug.test.ts
git commit -m "feat: add supplier slug generation with collision handling"
```

---

### Task 2: Supplier profile input validation (Zod, TDD)

**Files:**

- Create: `src/modules/suppliers/validation.ts`
- Test: `src/modules/suppliers/validation.test.ts`

**Interfaces:**

- Consumes: `zod`.
- Produces: `supplierProfileInputSchema`, `type SupplierProfileInput` — Task 6 (`service.ts`) and Task 7 (`actions.ts`) both import these.

- [ ] **Step 1: Write the failing tests**

`src/modules/suppliers/validation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { supplierProfileInputSchema } from "./validation";

describe("supplierProfileInputSchema", () => {
  it("accepts a minimal valid submission", () => {
    const result = supplierProfileInputSchema.safeParse({
      companyName: "Test Supplier",
      whatsappNumber: "+971500000000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing company name", () => {
    const result = supplierProfileInputSchema.safeParse({
      companyName: "",
      whatsappNumber: "+971500000000",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing WhatsApp number", () => {
    const result = supplierProfileInputSchema.safeParse({
      companyName: "Test Supplier",
      whatsappNumber: "",
    });
    expect(result.success).toBe(false);
  });

  it("converts empty optional fields to null", () => {
    const result = supplierProfileInputSchema.safeParse({
      companyName: "Test Supplier",
      whatsappNumber: "+971500000000",
      phone: "",
      email: "",
      website: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
      expect(result.data.email).toBeNull();
      expect(result.data.website).toBeNull();
    }
  });

  it("trims whitespace from text fields", () => {
    const result = supplierProfileInputSchema.safeParse({
      companyName: "  Test Supplier  ",
      whatsappNumber: "+971500000000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBe("Test Supplier");
    }
  });

  it("defaults brandIds/categoryIds to empty arrays when omitted", () => {
    const result = supplierProfileInputSchema.safeParse({
      companyName: "Test Supplier",
      whatsappNumber: "+971500000000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.brandIds).toEqual([]);
      expect(result.data.categoryIds).toEqual([]);
    }
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
pnpm test validation
```

Expected: FAIL — `./validation` doesn't exist yet.

- [ ] **Step 3: Implement**

`src/modules/suppliers/validation.ts`:

```ts
import { z } from "zod";

function optionalText() {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null));
}

export const supplierProfileInputSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  whatsappNumber: z.string().trim().min(1, "WhatsApp number is required"),
  logo: optionalText(),
  description: optionalText(),
  phone: optionalText(),
  email: optionalText(),
  website: optionalText(),
  locationName: optionalText(),
  address: optionalText(),
  googleMapsUrl: optionalText(),
  brandIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
});

export type SupplierProfileInput = z.infer<typeof supplierProfileInputSchema>;
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
pnpm test validation
```

Expected: PASS — 6/6.

- [ ] **Step 5: Commit**

```bash
git add src/modules/suppliers/validation.ts src/modules/suppliers/validation.test.ts
git commit -m "feat: add Zod validation for supplier profile input"
```

---

### Task 3: Supplier record types + real/mock merge logic (TDD)

**Files:**

- Modify: `src/modules/suppliers/types.ts`
- Create: `src/modules/suppliers/queries.ts` (only `toSupplierProfile` this task; DB-touching reads land in Task 4)
- Test: `src/modules/suppliers/queries.test.ts`

**Interfaces:**

- Consumes: `SupplierProfile` (existing), `getMockSupplierBySlug` (existing `mock-data.ts`).
- Produces: `SupplierRecord`, `SupplierRecordWithAssociations` (types — Task 4/6 use these), `toSupplierProfile(row: SupplierRecord): SupplierProfile` (Task 4's `getSupplierBySlug` calls this).

- [ ] **Step 1: Add the new types**

Append to `src/modules/suppliers/types.ts`:

```ts
export interface SupplierRecord {
  id: string;
  userId: string;
  companyName: string;
  slug: string;
  logo: string | null;
  description: string | null;
  whatsappNumber: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  locationName: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  verified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierRecordWithAssociations extends SupplierRecord {
  brandIds: string[];
  categoryIds: string[];
}
```

- [ ] **Step 2: Write the failing tests for the merge function**

`src/modules/suppliers/queries.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { toSupplierProfile } from "./queries";
import type { SupplierRecord } from "./types";

function makeRow(overrides: Partial<SupplierRecord> = {}): SupplierRecord {
  return {
    id: "row-1",
    userId: "user-1",
    companyName: "Fresh Supplier Co",
    slug: "fresh-supplier-co",
    logo: null,
    description: "A brand new supplier",
    whatsappNumber: "+971500000001",
    phone: null,
    email: null,
    website: null,
    locationName: null,
    address: null,
    googleMapsUrl: null,
    verified: false,
    active: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("toSupplierProfile", () => {
  it("uses the real row's identity/contact fields", () => {
    const profile = toSupplierProfile(makeRow());
    expect(profile.companyName).toBe("Fresh Supplier Co");
    expect(profile.whatsappNumber).toBe("+971500000001");
    expect(profile.verified).toBe(false);
  });

  it("derives logoInitial from companyName", () => {
    const profile = toSupplierProfile(
      makeRow({ companyName: "zelda traders" }),
    );
    expect(profile.logoInitial).toBe("Z");
  });

  it("zero-states placeholder fields for a supplier with no mock-data match", () => {
    const profile = toSupplierProfile(
      makeRow({ slug: "brand-new-slug-not-in-mocks" }),
    );
    expect(profile.topBrands).toEqual([]);
    expect(profile.categoryMix).toEqual([]);
    expect(profile.broadcastActivity).toEqual([]);
    expect(profile.businessHours).toEqual([]);
    expect(profile.tags).toEqual([]);
    expect(profile.activeOfferCount).toBe(0);
    expect(profile.positiveScorePercent).toBe(0);
    expect(profile.avgResponseTimeLabel).toBe("—");
  });

  it("uses mock-sourced placeholder fields for a seeded demo supplier's slug", () => {
    const profile = toSupplierProfile(
      makeRow({
        slug: "al-hadi-computers",
        companyName: "Al Hadi Computers LLC",
      }),
    );
    expect(profile.topBrands.length).toBeGreaterThan(0);
    expect(profile.activeOfferCount).toBe(320);
  });

  it("falls back locationName to a dash when neither the row nor mock data has one", () => {
    const profile = toSupplierProfile(
      makeRow({ slug: "brand-new-slug-not-in-mocks", locationName: null }),
    );
    expect(profile.locationName).toBe("—");
  });
});
```

- [ ] **Step 3: Run tests, verify they fail**

```bash
pnpm test queries
```

Expected: FAIL — `./queries` doesn't exist yet.

- [ ] **Step 4: Implement `toSupplierProfile`**

`src/modules/suppliers/queries.ts` (this task writes only the import and
this one function — Task 4 appends the DB-touching exports below it):

```ts
import { getMockSupplierBySlug } from "./mock-data";
import type { SupplierProfile, SupplierRecord } from "./types";

export function toSupplierProfile(row: SupplierRecord): SupplierProfile {
  const mock = getMockSupplierBySlug(row.slug);
  return {
    id: row.id,
    slug: row.slug,
    companyName: row.companyName,
    logoInitial: row.companyName.charAt(0).toUpperCase(),
    verified: row.verified,
    locationName: row.locationName ?? mock?.locationName ?? "—",
    activeOfferCount: mock?.activeOfferCount ?? 0,
    positiveScorePercent: mock?.positiveScorePercent ?? 0,
    description: row.description,
    whatsappNumber: row.whatsappNumber,
    phone: row.phone,
    email: row.email,
    address: row.address,
    googleMapsUrl: row.googleMapsUrl,
    tags: mock?.tags ?? [],
    lastBroadcastAt: mock?.lastBroadcastAt ?? row.createdAt.toISOString(),
    memberSinceYear: mock?.memberSinceYear ?? row.createdAt.getFullYear(),
    avgResponseTimeLabel: mock?.avgResponseTimeLabel ?? "—",
    topBrands: mock?.topBrands ?? [],
    categoryMix: mock?.categoryMix ?? [],
    broadcastActivity: mock?.broadcastActivity ?? [],
    businessHours: mock?.businessHours ?? [],
  };
}
```

- [ ] **Step 5: Run tests, verify they pass**

```bash
pnpm test queries
```

Expected: PASS — 5/5.

- [ ] **Step 6: Full type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors (confirms `types.ts`'s additions compile cleanly
against the rest of the module).

- [ ] **Step 7: Commit**

```bash
git add src/modules/suppliers/types.ts src/modules/suppliers/queries.ts src/modules/suppliers/queries.test.ts
git commit -m "feat: add supplier record types and real/mock profile merge"
```

---

### Task 4: Supplier queries — seeding + DB reads

**Files:**

- Modify: `src/modules/suppliers/queries.ts` (append to Task 3's file)

**Interfaces:**

- Consumes: `db` (`@/lib/database/client`), `suppliers`/`supplierBrands`/`supplierCategories` (`./schema`), `user` (`@/modules/auth/schema`), `auth` (`@/lib/auth/config`), `getMockSuppliers`/`getMockSupplierBySlug` (`./mock-data`), `toSupplierProfile` (Task 3).
- Produces: `getSupplierBySlug(slug): Promise<SupplierProfile | undefined>`, `getSupplierByUserId(userId): Promise<SupplierRecordWithAssociations | undefined>`, `listSuppliersForAdmin(): Promise<SupplierRecord[]>` — Task 9/10/11 call these.

This task is DB I/O (seeding the six demo suppliers, each needing a real
`user` row first to satisfy `suppliers.userId`'s `NOT NULL UNIQUE` FK).
Following this project's existing convention for I/O-heavy code (Phase 1's
`seed.ts`), it is not Vitest-unit-tested — it is written directly and
verified live against real Docker Postgres.

- [ ] **Step 1: Implement**

Append to `src/modules/suppliers/queries.ts`:

```ts
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/database/client";
import { user } from "@/modules/auth/schema";
import { getMockSuppliers } from "./mock-data";
import { suppliers, supplierBrands, supplierCategories } from "./schema";
import type { SupplierRecordWithAssociations } from "./types";

let seeded = false;

async function ensureSeeded(): Promise<void> {
  if (seeded) return;

  const existing = await db
    .select({ id: suppliers.id })
    .from(suppliers)
    .limit(1);
  if (existing.length > 0) {
    seeded = true;
    return;
  }

  for (const summary of getMockSuppliers()) {
    const profile = getMockSupplierBySlug(summary.slug);
    if (!profile) continue;

    const seedEmail = `${profile.slug}@seed.souqfeed.internal`;

    await auth.api.signUpEmail({
      body: {
        email: seedEmail,
        password: randomUUID(),
        name: profile.companyName,
      },
    });

    const [seededUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, seedEmail))
      .limit(1);
    if (!seededUser) continue;

    await db.insert(suppliers).values({
      userId: seededUser.id,
      companyName: profile.companyName,
      slug: profile.slug,
      description: profile.description,
      whatsappNumber: profile.whatsappNumber,
      phone: profile.phone,
      email: profile.email,
      address: profile.address,
      googleMapsUrl: profile.googleMapsUrl,
      verified: profile.verified,
    });
  }

  seeded = true;
}

export async function getSupplierBySlug(
  slug: string,
): Promise<import("./types").SupplierProfile | undefined> {
  await ensureSeeded();
  const [row] = await db
    .select()
    .from(suppliers)
    .where(and(eq(suppliers.slug, slug), eq(suppliers.active, true)))
    .limit(1);
  if (!row) return undefined;
  return toSupplierProfile(row);
}

export async function getSupplierByUserId(
  userId: string,
): Promise<SupplierRecordWithAssociations | undefined> {
  await ensureSeeded();
  const [row] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.userId, userId))
    .limit(1);
  if (!row) return undefined;

  const brandRows = await db
    .select({ brandId: supplierBrands.brandId })
    .from(supplierBrands)
    .where(eq(supplierBrands.supplierId, row.id));
  const categoryRows = await db
    .select({ categoryId: supplierCategories.categoryId })
    .from(supplierCategories)
    .where(eq(supplierCategories.supplierId, row.id));

  return {
    ...row,
    brandIds: brandRows.map((r) => r.brandId),
    categoryIds: categoryRows.map((r) => r.categoryId),
  };
}

export async function listSuppliersForAdmin(): Promise<
  import("./types").SupplierRecord[]
> {
  await ensureSeeded();
  return db.select().from(suppliers).orderBy(suppliers.companyName);
}
```

(The inline `import("./types")` return-type annotations avoid re-declaring
a second top-level import line in this append step — leave them as-is;
there's no runtime cost, it's type-only.)

- [ ] **Step 2: Live-verify seeding from a fresh database**

```bash
docker compose down -v
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm db:migrate

pnpm tsx --env-file=.env -e "
import { getSupplierBySlug, listSuppliersForAdmin } from './src/modules/suppliers/queries';

async function main() {
  const all = await listSuppliersForAdmin();
  console.log('seeded supplier count (expect 6):', all.length);

  const alHadi = await getSupplierBySlug('al-hadi-computers');
  console.log('al-hadi companyName:', alHadi?.companyName);
  console.log('al-hadi topBrands length (expect > 0, from mock):', alHadi?.topBrands.length);

  process.exit(0);
}
main();
"
```

Expected: `seeded supplier count (expect 6): 6`; `al-hadi companyName:
Al Hadi Computers LLC`; `al-hadi topBrands length (expect > 0, from
mock): 6`.

- [ ] **Step 3: Verify the seed/FK pairing directly in Postgres**

```bash
docker compose exec -T postgres psql -U souqfeed -d souqfeed -c \
  "select s.company_name, u.email, u.role from suppliers s join \"user\" u on u.id = s.user_id order by s.company_name;"
```

Expected: 6 rows, each `email` ending in `@seed.souqfeed.internal` and
`role` = `SUPPLIER`.

- [ ] **Step 4: Verify idempotency (seeding runs once, not duplicated)**

```bash
pnpm tsx --env-file=.env -e "
import { listSuppliersForAdmin } from './src/modules/suppliers/queries';
async function main() {
  const all = await listSuppliersForAdmin();
  console.log('supplier count after second call (expect still 6):', all.length);
  process.exit(0);
}
main();
"
```

Expected: `supplier count after second call (expect still 6): 6` — the
`existing.length > 0` short-circuit in `ensureSeeded` prevents re-seeding.

- [ ] **Step 5: Verify `active = false` is excluded from the public read (Review Focus)**

```bash
docker compose exec -T postgres psql -U souqfeed -d souqfeed -c \
  "update suppliers set active = false where slug = 'al-hadi-computers';"

pnpm tsx --env-file=.env -e "
import { getSupplierBySlug } from './src/modules/suppliers/queries';
async function main() {
  const result = await getSupplierBySlug('al-hadi-computers');
  console.log('inactive supplier lookup (expect undefined):', result);
  process.exit(0);
}
main();
"

docker compose exec -T postgres psql -U souqfeed -d souqfeed -c \
  "update suppliers set active = true where slug = 'al-hadi-computers';"
```

Expected: `inactive supplier lookup (expect undefined): undefined`. The
final `update ... active = true` restores state for later tasks.

```bash
docker compose down
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/suppliers/queries.ts
git commit -m "feat: seed demo suppliers and add real supplier read queries"
```

---

### Task 5: Brands & Categories read queries

**Files:**

- Create: `src/modules/brands/queries.ts`
- Create: `src/modules/categories/queries.ts`

**Interfaces:**

- Consumes: `db`, `brands` (`./schema`), `getMockBrands` (`./mock-data`) for the brands file; `categories` (`./schema`), `getMockCategories` for the categories file.
- Produces: `listBrands(): Promise<Brand[]>`, `listCategories(): Promise<Category[]>` — Task 9's dashboard page calls both to populate `SupplierProfileForm`'s multi-selects.

Same DB-first/seed-fallback pattern as suppliers, without the FK wrinkle
(neither table references `user`). I/O, verified live, not Vitest-tested.

- [ ] **Step 1: Implement brands queries**

`src/modules/brands/queries.ts`:

```ts
import { db } from "@/lib/database/client";
import { getMockBrands } from "./mock-data";
import { brands } from "./schema";
import type { Brand } from "./types";

let seeded = false;

export async function listBrands(): Promise<Brand[]> {
  if (!seeded) {
    const existing = await db.select({ id: brands.id }).from(brands).limit(1);
    if (existing.length === 0) {
      const mocks = getMockBrands();
      if (mocks.length > 0) {
        await db
          .insert(brands)
          .values(mocks.map((b) => ({ name: b.name, slug: b.slug })));
      }
    }
    seeded = true;
  }

  const rows = await db.select().from(brands).orderBy(brands.name);
  return rows.map((row) => ({ id: row.id, name: row.name, slug: row.slug }));
}
```

- [ ] **Step 2: Implement categories queries**

`src/modules/categories/queries.ts`:

```ts
import { db } from "@/lib/database/client";
import { getMockCategories } from "./mock-data";
import { categories } from "./schema";
import type { Category } from "./types";

let seeded = false;

export async function listCategories(): Promise<Category[]> {
  if (!seeded) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .limit(1);
    if (existing.length === 0) {
      const mocks = getMockCategories();
      if (mocks.length > 0) {
        await db
          .insert(categories)
          .values(mocks.map((c) => ({ name: c.name, slug: c.slug })));
      }
    }
    seeded = true;
  }

  const rows = await db.select().from(categories).orderBy(categories.name);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    offerCount: 0,
  }));
}
```

`offerCount: 0` is a deliberate zero-state, same reasoning as suppliers'
placeholder fields — real offer counts don't exist until Phase 7, and this
function is only consumed here for multi-select labels (id + name), never
for displaying a count.

- [ ] **Step 3: Live-verify both seed from empty tables**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done

pnpm tsx --env-file=.env -e "
import { listBrands } from './src/modules/brands/queries';
import { listCategories } from './src/modules/categories/queries';
async function main() {
  const brands = await listBrands();
  const categories = await listCategories();
  console.log('brand count (expect 10):', brands.length);
  console.log('category count (expect 8):', categories.length);
  console.log('first brand:', brands[0]?.name);
  process.exit(0);
}
main();
"

docker compose down
```

Expected: `brand count (expect 10): 10`; `category count (expect 8): 8`.

- [ ] **Step 4: Commit**

```bash
git add src/modules/brands/queries.ts src/modules/categories/queries.ts
git commit -m "feat: add brands/categories read queries with seed fallback"
```

---

### Task 6: Supplier service layer (create/update/admin actions)

**Files:**

- Create: `src/modules/suppliers/service.ts`

**Interfaces:**

- Consumes: `db`, `suppliers`/`supplierBrands`/`supplierCategories` (`./schema`), `slugify`/`resolveUniqueSlug` (Task 1), `SupplierProfileInput` (Task 2).
- Produces: `createOwnProfile(userId, input)`, `updateOwnProfile(userId, input)`, `setVerified(supplierId, verified)`, `setActive(supplierId, active)` — all four called by Task 7's `actions.ts`.

I/O (business logic over the DB), written directly and verified live, per
this project's established convention for this kind of code.

- [ ] **Step 1: Implement**

`src/modules/suppliers/service.ts`:

```ts
import { eq } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { resolveUniqueSlug } from "./slug";
import { suppliers, supplierBrands, supplierCategories } from "./schema";
import type { SupplierProfileInput } from "./validation";

async function syncAssociations(
  supplierId: string,
  brandIds: string[],
  categoryIds: string[],
): Promise<void> {
  await db
    .delete(supplierBrands)
    .where(eq(supplierBrands.supplierId, supplierId));
  await db
    .delete(supplierCategories)
    .where(eq(supplierCategories.supplierId, supplierId));

  if (brandIds.length > 0) {
    await db
      .insert(supplierBrands)
      .values(brandIds.map((brandId) => ({ supplierId, brandId })));
  }
  if (categoryIds.length > 0) {
    await db
      .insert(supplierCategories)
      .values(categoryIds.map((categoryId) => ({ supplierId, categoryId })));
  }
}

export async function createOwnProfile(
  userId: string,
  input: SupplierProfileInput,
) {
  const slug = await resolveUniqueSlug(input.companyName, async (candidate) => {
    const existing = await db
      .select({ id: suppliers.id })
      .from(suppliers)
      .where(eq(suppliers.slug, candidate))
      .limit(1);
    return existing.length > 0;
  });

  const [row] = await db
    .insert(suppliers)
    .values({
      userId,
      companyName: input.companyName,
      slug,
      logo: input.logo,
      description: input.description,
      whatsappNumber: input.whatsappNumber,
      phone: input.phone,
      email: input.email,
      website: input.website,
      locationName: input.locationName,
      address: input.address,
      googleMapsUrl: input.googleMapsUrl,
    })
    .returning();

  await syncAssociations(row.id, input.brandIds, input.categoryIds);
  return row;
}

export async function updateOwnProfile(
  userId: string,
  input: SupplierProfileInput,
) {
  const [row] = await db
    .update(suppliers)
    .set({
      companyName: input.companyName,
      logo: input.logo,
      description: input.description,
      whatsappNumber: input.whatsappNumber,
      phone: input.phone,
      email: input.email,
      website: input.website,
      locationName: input.locationName,
      address: input.address,
      googleMapsUrl: input.googleMapsUrl,
      updatedAt: new Date(),
    })
    .where(eq(suppliers.userId, userId))
    .returning();

  if (!row) {
    throw new Error("No supplier profile exists for this user");
  }

  await syncAssociations(row.id, input.brandIds, input.categoryIds);
  return row;
}

export async function setVerified(supplierId: string, verified: boolean) {
  await db
    .update(suppliers)
    .set({ verified, updatedAt: new Date() })
    .where(eq(suppliers.id, supplierId));
}

export async function setActive(supplierId: string, active: boolean) {
  await db
    .update(suppliers)
    .set({ active, updatedAt: new Date() })
    .where(eq(suppliers.id, supplierId));
}
```

Note `updateOwnProfile`'s `where(eq(suppliers.userId, userId))` — this is
the ownership scoping Review Focus calls out: the function takes no
supplier id at all, only the caller's own `userId`, so there is no code
path by which it could touch another supplier's row.

- [ ] **Step 2: Live-verify create + update + ownership isolation**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm db:migrate

pnpm tsx --env-file=.env -e "
import { auth } from './src/lib/auth/config';
import { db } from './src/lib/database/client';
import { user } from './src/modules/auth/schema';
import { eq } from 'drizzle-orm';
import { createOwnProfile, updateOwnProfile } from './src/modules/suppliers/service';

async function main() {
  await auth.api.signUpEmail({ body: { email: 'svc-test-a@test.local', password: 'test-password-123', name: 'Svc Test A' } });
  await auth.api.signUpEmail({ body: { email: 'svc-test-b@test.local', password: 'test-password-123', name: 'Svc Test B' } });
  const [userA] = await db.select().from(user).where(eq(user.email, 'svc-test-a@test.local'));
  const [userB] = await db.select().from(user).where(eq(user.email, 'svc-test-b@test.local'));

  const rowA = await createOwnProfile(userA.id, {
    companyName: 'Service Test Supplier', whatsappNumber: '+971500000010',
    logo: null, description: null, phone: null, email: null, website: null,
    locationName: null, address: null, googleMapsUrl: null, brandIds: [], categoryIds: [],
  });
  const rowB = await createOwnProfile(userB.id, {
    companyName: 'Service Test Supplier', whatsappNumber: '+971500000011',
    logo: null, description: null, phone: null, email: null, website: null,
    locationName: null, address: null, googleMapsUrl: null, brandIds: [], categoryIds: [],
  });
  console.log('slug A:', rowA.slug);
  console.log('slug B (expect suffixed, same base name):', rowB.slug);

  await updateOwnProfile(userA.id, {
    companyName: 'Service Test Supplier UPDATED', whatsappNumber: '+971500000010',
    logo: null, description: null, phone: null, email: null, website: null,
    locationName: null, address: null, googleMapsUrl: null, brandIds: [], categoryIds: [],
  });

  const [freshA] = await db.select().from(require('./src/modules/suppliers/schema').suppliers).where(eq(require('./src/modules/suppliers/schema').suppliers.userId, userA.id));
  const [freshB] = await db.select().from(require('./src/modules/suppliers/schema').suppliers).where(eq(require('./src/modules/suppliers/schema').suppliers.userId, userB.id));
  console.log('A companyName after update (expect UPDATED):', freshA.companyName);
  console.log('B companyName after A updated (expect unchanged):', freshB.companyName);

  process.exit(0);
}
main();
"
```

Expected: `slug A: service-test-supplier`; `slug B (expect suffixed, same
base name): service-test-supplier-2`; `A companyName after update (expect
UPDATED): Service Test Supplier UPDATED`; `B companyName after A updated
(expect unchanged): Service Test Supplier` — confirming `updateOwnProfile`
never touches another supplier's row (Review Focus).

```bash
docker compose down
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/suppliers/service.ts
git commit -m "feat: add supplier service layer for create/update/verify/activate"
```

---

### Task 7: Supplier Server Actions

**Files:**

- Create: `src/modules/suppliers/actions.ts`

**Interfaces:**

- Consumes: `getCurrentSession` (`@/lib/auth/session`), `authorizeRole` (`@/modules/auth/guards`), `supplierProfileInputSchema` (Task 2), `createOwnProfile`/`updateOwnProfile`/`setVerified`/`setActive` (Task 6).
- Produces: `createOwnSupplierProfile`, `updateOwnSupplierProfile` (both `(prevState: SupplierFormState, formData: FormData) => Promise<SupplierFormState>`, for `useActionState`), `adminSetVerified(supplierId, verified, slug)`, `adminSetActive(supplierId, active, slug)`, `type SupplierFormState` — Task 8's form and Task 10's admin table call these.

- [ ] **Step 1: Implement**

`src/modules/suppliers/actions.ts`:

```ts
"use server";

import type { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";
import {
  createOwnProfile,
  setActive,
  setVerified,
  updateOwnProfile,
} from "./service";
import { supplierProfileInputSchema } from "./validation";

export interface SupplierFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

function flattenZodErrors(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

function parseFormInput(formData: FormData) {
  return {
    companyName: String(formData.get("companyName") ?? ""),
    whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
    logo: String(formData.get("logo") ?? ""),
    description: String(formData.get("description") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    website: String(formData.get("website") ?? ""),
    locationName: String(formData.get("locationName") ?? ""),
    address: String(formData.get("address") ?? ""),
    googleMapsUrl: String(formData.get("googleMapsUrl") ?? ""),
    brandIds: formData.getAll("brandIds").map(String),
    categoryIds: formData.getAll("categoryIds").map(String),
  };
  // Note: deliberately no `verified`/`active` keys read here, at all —
  // there is no code path by which a supplier's own submission could set
  // them (Review Focus / Global Constraints).
}

export async function createOwnSupplierProfile(
  _prev: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "SUPPLIER")) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = supplierProfileInputSchema.safeParse(parseFormInput(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: flattenZodErrors(parsed.error) };
  }

  await createOwnProfile(session.user.id, parsed.data);
  revalidatePath("/dashboard");
  return { status: "success", message: "Profile created." };
}

export async function updateOwnSupplierProfile(
  _prev: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "SUPPLIER")) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = supplierProfileInputSchema.safeParse(parseFormInput(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: flattenZodErrors(parsed.error) };
  }

  const row = await updateOwnProfile(session.user.id, parsed.data);
  revalidatePath("/dashboard");
  revalidatePath(`/suppliers/${row.slug}`);
  return { status: "success", message: "Profile updated." };
}

export async function adminSetVerified(
  supplierId: string,
  verified: boolean,
  slug: string,
): Promise<void> {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "ADMIN")) {
    throw new Error("Not authorized.");
  }
  await setVerified(supplierId, verified);
  revalidatePath("/admin");
  revalidatePath(`/suppliers/${slug}`);
}

export async function adminSetActive(
  supplierId: string,
  active: boolean,
  slug: string,
): Promise<void> {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "ADMIN")) {
    throw new Error("Not authorized.");
  }
  await setActive(supplierId, active);
  revalidatePath("/admin");
  revalidatePath(`/suppliers/${slug}`);
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

This task's behavioral verification (does an unauthenticated/wrong-role
caller actually get rejected) requires a real request context —
`getCurrentSession()` calls `next/headers`' `headers()`, which only works
inside an actual Next.js request, not a bare script. Rather than invent an
unreliable hand-written reproduction of Next's internal Server Action wire
protocol for curl, that check is deferred to Task 12's full browser-driven
pass, which exercises these actions the same way a real user would.

- [ ] **Step 3: Commit**

```bash
git add src/modules/suppliers/actions.ts
git commit -m "feat: add supplier Server Actions with session/role re-checks"
```

---

### Task 8: shadcn primitives + SupplierProfileForm + SignOutButton

**Files:**

- Create: `src/components/ui/textarea.tsx`, `src/components/ui/table.tsx` (generated)
- Create: `src/components/suppliers/supplier-profile-form.tsx`
- Create: `src/components/auth/sign-out-button.tsx`

**Interfaces:**

- Consumes: `Button`/`Input`/`Label`/`Checkbox`/`Badge`/`Textarea` (ui), `createOwnSupplierProfile`/`updateOwnSupplierProfile`/`SupplierFormState` (Task 7), `SupplierRecordWithAssociations` (Task 3), `Brand` (`@/modules/brands/types`), `Category` (`@/modules/categories/types`), `authClient` (`@/lib/auth/client`).
- Produces: `<SupplierProfileForm mode brands categories supplier? />`, `<SignOutButton />` — Task 9 (dashboard) and Task 10 (admin page) use both.

- [ ] **Step 1: Generate the two missing shadcn primitives**

```bash
pnpm exec shadcn add textarea table --yes
```

Expected: two new untracked files, `src/components/ui/textarea.tsx` and
`src/components/ui/table.tsx`, matching this project's existing
`@base-ui/react` + `cn()` style (same as the Phase 0.5 primitives).

- [ ] **Step 2: Write the sign-out button**

`src/components/auth/sign-out-button.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
      }}
    >
      Sign out
    </Button>
  );
}
```

- [ ] **Step 3: Write the supplier profile form**

`src/components/suppliers/supplier-profile-form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Brand } from "@/modules/brands/types";
import type { Category } from "@/modules/categories/types";
import {
  createOwnSupplierProfile,
  updateOwnSupplierProfile,
  type SupplierFormState,
} from "@/modules/suppliers/actions";
import type { SupplierRecordWithAssociations } from "@/modules/suppliers/types";

const INITIAL_STATE: SupplierFormState = { status: "idle" };

function Field({
  label,
  name,
  required,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string | null;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>
        {label}
        {required && " *"}
      </Label>
      <Input
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

export function SupplierProfileForm({
  mode,
  supplier,
  brands,
  categories,
}: {
  mode: "create" | "edit";
  supplier?: SupplierRecordWithAssociations;
  brands: Brand[];
  categories: Category[];
}) {
  const action =
    mode === "create" ? createOwnSupplierProfile : updateOwnSupplierProfile;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {mode === "edit" && supplier && (
        <div className="flex gap-2">
          <Badge variant={supplier.verified ? "default" : "secondary"}>
            {supplier.verified ? "Verified" : "Not verified"}
          </Badge>
          <Badge variant={supplier.active ? "default" : "destructive"}>
            {supplier.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      )}

      <Field
        label="Company name"
        name="companyName"
        required
        defaultValue={supplier?.companyName}
        error={state.fieldErrors?.companyName}
      />
      <Field
        label="WhatsApp number"
        name="whatsappNumber"
        required
        defaultValue={supplier?.whatsappNumber}
        error={state.fieldErrors?.whatsappNumber}
      />
      <Field label="Phone" name="phone" defaultValue={supplier?.phone} />
      <Field label="Email" name="email" defaultValue={supplier?.email} />
      <Field label="Website" name="website" defaultValue={supplier?.website} />
      <Field
        label="Location"
        name="locationName"
        defaultValue={supplier?.locationName}
      />
      <Field label="Address" name="address" defaultValue={supplier?.address} />
      <Field
        label="Google Maps URL"
        name="googleMapsUrl"
        defaultValue={supplier?.googleMapsUrl}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={supplier?.description ?? ""}
          rows={4}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Brands you carry</legend>
        {brands.map((brand) => (
          <label key={brand.id} className="flex items-center gap-2 text-sm">
            <Checkbox
              name="brandIds"
              value={brand.id}
              defaultChecked={supplier?.brandIds.includes(brand.id)}
            />
            {brand.name}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Categories you carry</legend>
        {categories.map((category) => (
          <label key={category.id} className="flex items-center gap-2 text-sm">
            <Checkbox
              name="categoryIds"
              value={category.id}
              defaultChecked={supplier?.categoryIds.includes(category.id)}
            />
            {category.name}
          </label>
        ))}
      </fieldset>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      )}
      {state.status === "success" && state.message && (
        <p className="text-primary text-sm">{state.message}</p>
      )}

      <Button type="submit" disabled={pending}>
        {mode === "create" ? "Create profile" : "Save changes"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Type-check and lint**

```bash
pnpm exec tsc --noEmit
pnpm lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/textarea.tsx src/components/ui/table.tsx src/components/suppliers/supplier-profile-form.tsx src/components/auth/sign-out-button.tsx
git commit -m "feat: add supplier profile form and sign-out button components"
```

---

### Task 9: Wire `/dashboard`

**Files:**

- Modify: `src/app/dashboard/page.tsx`

**Interfaces:**

- Consumes: `getSupplierByUserId` (Task 4), `listBrands` (Task 5), `listCategories` (Task 5), `SupplierProfileForm`/`SignOutButton` (Task 8).
- Produces: a working `/dashboard` — no exports for later tasks.

- [ ] **Step 1: Rewrite the page**

`src/app/dashboard/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";
import { listBrands } from "@/modules/brands/queries";
import { listCategories } from "@/modules/categories/queries";
import { getSupplierByUserId } from "@/modules/suppliers/queries";
import { SupplierProfileForm } from "@/components/suppliers/supplier-profile-form";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  if (!authorizeRole(session.user.role, "SUPPLIER")) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  const [supplier, brands, categories] = await Promise.all([
    getSupplierByUserId(session.user.id),
    listBrands(),
    listCategories(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
        <SignOutButton />
      </div>
      <p className="text-muted-foreground mb-6 text-sm">
        Signed in as {session.user.email}
      </p>
      <SupplierProfileForm
        mode={supplier ? "edit" : "create"}
        supplier={supplier}
        brands={brands}
        categories={categories}
      />
    </main>
  );
}
```

- [ ] **Step 2: Live-verify both the create and edit paths**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm db:migrate
pnpm dev > /tmp/dev-phase2.log 2>&1 &
DEVPID=$!
sleep 5

curl -s -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"dashboard-test@test.local","password":"test-password-123","name":"Dashboard Test"}' > /dev/null

curl -s -c /tmp/cookies-p2.txt -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"dashboard-test@test.local","password":"test-password-123"}' > /dev/null

curl -s -b /tmp/cookies-p2.txt -o /dev/null -w "dashboard (no profile yet) status: %{http_code}\n" \
  http://localhost:3000/dashboard

curl -s -b /tmp/cookies-p2.txt http://localhost:3000/dashboard | grep -o "Create profile" | head -1

kill $DEVPID 2>/dev/null
wait $DEVPID 2>/dev/null
docker compose down
rm -f /tmp/cookies-p2.txt
```

Expected: `dashboard (no profile yet) status: 200`; the page contains
"Create profile" (confirming create-mode renders for a user with no
`suppliers` row yet). The full create→submit→edit-mode round trip (which
needs real form submission, not just a GET) is exercised in Task 12's
browser pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: wire supplier dashboard to real create/edit profile form"
```

---

### Task 10: Admin supplier table + wire `/admin`

**Files:**

- Create: `src/components/admin/admin-supplier-table.tsx`
- Modify: `src/app/admin/page.tsx`

**Interfaces:**

- Consumes: `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` (Task 8's generated `ui/table.tsx`), `Button`/`Badge` (ui), `adminSetVerified`/`adminSetActive` (Task 7), `listSuppliersForAdmin` (Task 4), `SignOutButton` (Task 8).
- Produces: a working `/admin` — no exports for later tasks.

- [ ] **Step 1: Write the admin table**

`src/components/admin/admin-supplier-table.tsx`:

```tsx
"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminSetActive, adminSetVerified } from "@/modules/suppliers/actions";
import type { SupplierRecord } from "@/modules/suppliers/types";

function SupplierRow({ supplier }: { supplier: SupplierRecord }) {
  const [isPending, startTransition] = useTransition();

  return (
    <TableRow>
      <TableCell>{supplier.companyName}</TableCell>
      <TableCell>
        <Badge variant={supplier.verified ? "default" : "secondary"}>
          {supplier.verified ? "Verified" : "Not verified"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={supplier.active ? "default" : "destructive"}>
          {supplier.active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              adminSetVerified(supplier.id, !supplier.verified, supplier.slug),
            )
          }
        >
          {supplier.verified ? "Unverify" : "Verify"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              adminSetActive(supplier.id, !supplier.active, supplier.slug),
            )
          }
        >
          {supplier.active ? "Deactivate" : "Reactivate"}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function AdminSupplierTable({
  suppliers,
}: {
  suppliers: SupplierRecord[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Verification</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => (
          <SupplierRow key={supplier.id} supplier={supplier} />
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 2: Rewrite the admin page**

`src/app/admin/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";
import { listSuppliersForAdmin } from "@/modules/suppliers/queries";
import { AdminSupplierTable } from "@/components/admin/admin-supplier-table";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function AdminPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  if (!authorizeRole(session.user.role, "ADMIN")) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  const suppliers = await listSuppliersForAdmin();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <SignOutButton />
      </div>
      <p className="text-muted-foreground mb-6 text-sm">
        Signed in as {session.user.email}
      </p>
      <AdminSupplierTable suppliers={suppliers} />
    </main>
  );
}
```

- [ ] **Step 3: Live-verify the admin page lists seeded suppliers**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm db:migrate
pnpm db:seed
pnpm dev > /tmp/dev-phase2b.log 2>&1 &
DEVPID=$!
sleep 5

curl -s -c /tmp/cookies-admin.txt -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$(grep ADMIN_EMAIL .env | cut -d= -f2)\",\"password\":\"$(grep ADMIN_PASSWORD .env | cut -d= -f2)\"}" > /dev/null

curl -s -b /tmp/cookies-admin.txt http://localhost:3000/admin | grep -o "Al Hadi Computers LLC"

kill $DEVPID 2>/dev/null
wait $DEVPID 2>/dev/null
docker compose down
rm -f /tmp/cookies-admin.txt
```

Expected: `Al Hadi Computers LLC` printed (confirming the admin page's
table renders a real seeded supplier). The verify/deactivate button clicks
themselves need a real browser (they're client-side `onClick` handlers) —
exercised in Task 12.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/admin-supplier-table.tsx src/app/admin/page.tsx
git commit -m "feat: wire admin panel to real supplier list with verify/activate controls"
```

---

### Task 11: De-mock the public supplier page

**Files:**

- Modify: `src/app/suppliers/[slug]/page.tsx`

**Interfaces:**

- Consumes: `getSupplierBySlug` (Task 4).
- Produces: a working real `/suppliers/[slug]` — no exports for later tasks.

- [ ] **Step 1: Swap the data source**

In `src/app/suppliers/[slug]/page.tsx`, replace:

```tsx
import { getMockSupplierBySlug } from "@/modules/suppliers/mock-data";
```

with:

```tsx
import { getSupplierBySlug } from "@/modules/suppliers/queries";
```

and replace:

```tsx
const supplier = getMockSupplierBySlug(slug);
```

with:

```tsx
const supplier = await getSupplierBySlug(slug);
```

(The page function is already `async`, and `params` is already awaited
above this line — no other changes needed. `getMockOffers()` stays as-is;
offers remain mock-sourced until Phase 7.)

- [ ] **Step 2: Live-verify a real (non-seeded) supplier's page renders, and an inactive one 404s**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm db:migrate
pnpm dev > /tmp/dev-phase2c.log 2>&1 &
DEVPID=$!
sleep 5

curl -s -o /dev/null -w "seeded supplier page status: %{http_code}\n" \
  http://localhost:3000/suppliers/al-hadi-computers

curl -s -o /dev/null -w "unknown slug status (expect 404): %{http_code}\n" \
  http://localhost:3000/suppliers/does-not-exist-at-all

docker compose exec -T postgres psql -U souqfeed -d souqfeed -c \
  "update suppliers set active = false where slug = 'al-hadi-computers';"

curl -s -o /dev/null -w "deactivated supplier page status (expect 404): %{http_code}\n" \
  http://localhost:3000/suppliers/al-hadi-computers

docker compose exec -T postgres psql -U souqfeed -d souqfeed -c \
  "update suppliers set active = true where slug = 'al-hadi-computers';"

kill $DEVPID 2>/dev/null
wait $DEVPID 2>/dev/null
docker compose down
```

Expected: `seeded supplier page status: 200`; `unknown slug status
(expect 404): 404`; `deactivated supplier page status (expect 404): 404`
(Review Focus — confirms deactivation actually hides the public page, not
just the UI).

- [ ] **Step 3: Commit**

```bash
git add src/app/suppliers/[slug]/page.tsx
git commit -m "feat: de-mock the public supplier profile page"
```

---

### Task 12: Full end-to-end verification and status update

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
```

Expected: every command succeeds against a genuinely fresh volume,
including the suppliers/brands/categories seed-fallback running for the
first time against truly empty tables (not already-migrated ones).

- [ ] **Step 2: Full browser-driven pass**

```bash
pnpm dev > /tmp/dev-phase2-final.log 2>&1 &
DEVPID=$!
sleep 5
```

Using an actual browser (or Playwright if available) against
`http://localhost:3000`:

1. Sign up a brand-new SUPPLIER account. Visit `/dashboard` — confirm it
   shows the create-profile form (not an edit form), with no
   verified/active fields anywhere in it.
2. Submit the create form with a company name, WhatsApp number, and a
   couple of brand/category checkboxes ticked. Confirm the page now shows
   the edit form with a "Not verified" / "Active" badge pair and the same
   company name pre-filled.
3. Visit `/suppliers/<the-new-slug>` — confirm the real company
   name/contact info appear, and that the activity-metric sections
   (top brands, category mix, broadcast activity) show their zero-state
   (not an error, not someone else's mock data).
4. Edit the profile (change the description), submit, and confirm the
   public page at the same slug reflects the change without a manual
   refresh being required beyond normal navigation.
5. Sign in as the seeded admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD` from
   `.env`). Visit `/admin` — confirm the new supplier appears in the list
   alongside the 6 seeded demo suppliers.
6. Click "Verify" for the new supplier. Revisit their public profile page
   — confirm the verified badge/checkmark now appears.
7. Click "Deactivate" for the new supplier. Revisit their public profile
   page — confirm it now 404s.

```bash
kill $DEVPID 2>/dev/null
wait $DEVPID 2>/dev/null
docker compose down
```

- [ ] **Step 3: Confirm no secrets tracked**

```bash
git status
git ls-files | grep -x '\.env' && echo "FAIL: .env is tracked" || echo "OK: .env not tracked"
```

- [ ] **Step 4: Update `current.md`**

Move the two "Next" bullets this phase completed (de-mocking Phase 0.5's
pages, Phase 2 supplier CRUD + admin verification) into "Completed"; set
"Next" to Phase 3 (Brands + Categories admin CRUD, canonical product
model) — noting that this phase already built minimal brand/category
_read_ queries (`listBrands`/`listCategories`) with seed-fallback, so
Phase 3's remaining work is admin CRUD for those tables, not starting from
scratch.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: complete Phase 2 supplier profiles (CRUD, public page, admin verification)"
```

## Self-Review Notes

- **Spec coverage:** every "Decisions" bullet in the spec maps to a task —
  placeholder-field zero-stating (Task 3), verified/active admin-only
  (Task 7/8's structural omission), slug immutability (Task 1/6, never
  exposed in Task 8's form), brand/category self-select (Task 5/6/8),
  admin scope (Task 10), profile-creation-as-a-mode (Task 8/9), the
  seeding FK wrinkle (Task 4), the module shape (Tasks 1-2 and 4-7), native
  Server Actions (Task 7/8), and the missing sign-out control (Task 8).
- **Type/name consistency:** `SupplierRecord`/`SupplierRecordWithAssociations`
  (Task 3) are the exact types Task 4's queries return and Task 8/10's
  components consume. `SupplierProfileInput` (Task 2) is what Task 6's
  `service.ts` and Task 7's `actions.ts` both import — checked for
  matching field names end to end (`companyName`, `whatsappNumber`, `logo`,
  `description`, `phone`, `email`, `website`, `locationName`, `address`,
  `googleMapsUrl`, `brandIds`, `categoryIds`). `SupplierFormState` (Task 7)
  is what Task 8's form destructures from `useActionState`.
- **Review Focus:** unauthorized self-service field tampering → Task 7's
  structural omission (`parseFormInput` never reads `verified`/`active`).
  Cross-supplier ownership → Task 6 Step 2's two-supplier isolation check.
  Slug collisions → Task 1's unit tests plus Task 6 Step 2's live
  same-name collision. Inactive-supplier visibility → Task 4 Step 5 and
  Task 11 Step 2, both live. Empty-database seeding → Task 4 Steps 2-4 and
  Task 12 Step 1's fresh-volume run.
- **No placeholders:** every step has complete file contents or runnable
  commands. The one deliberately deferred check (direct curl-based proof
  of `actions.ts`'s session re-check) is explained in Task 7 rather than
  faked with an invented Server Action wire-protocol reproduction — real
  coverage for it lives in Task 12's browser pass instead.
