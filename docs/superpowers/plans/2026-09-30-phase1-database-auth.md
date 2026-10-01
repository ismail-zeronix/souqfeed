# Phase 1: Database + Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give SouqFeed a real PostgreSQL schema for every core table, working email/password authentication with ADMIN/SUPPLIER roles, a seed script producing one admin account, and a minimal login page that proves the whole flow end-to-end.

**Architecture:** Drizzle ORM (postgres-js driver) against the Docker Compose Postgres from Phase 0. Better Auth (Drizzle adapter) owns `users`/`sessions`/`accounts`, generated via its own CLI against the installed version rather than hand-written, then hand-edited to make `role` a real Postgres enum. Domain tables (suppliers, brands, categories, products, broadcasts, offers, analytics) are added in one migration afterward, since `suppliers.userId` needs `users` to already exist. Route protection is two-layer, per Better Auth's documented Next.js pattern: `middleware.ts` does a cheap cookie-presence redirect (edge-safe, no DB hit), and each protected page independently verifies the real session + role server-side — the cheap check is not the security boundary.

**Tech Stack:** Drizzle ORM + drizzle-kit, `postgres` (postgres-js), Better Auth, `tsx` (running TS scripts directly), Vitest (pure-logic units only).

**Spec:** `docs/data-model.md` (full field-level schema for every table) and `docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md` (Better Auth + Drizzle adapter, email/password only, ADMIN/SUPPLIER roles — no social login).

## Global Constraints

- Package manager is pnpm — never npm/yarn (per `project_plan.md`).
- Every module owns its own `schema.ts` under `src/modules/<name>/` (per `docs/architecture.md`); `src/lib/database/schema.ts` is a barrel re-exporting all of them, populated incrementally by the tasks that add each module.
- Configuration is read through `getEnv()` (`src/lib/validation/env.ts`), never `process.env` directly, in any module meant to run at app boot (Rule from Phase 0's own Interfaces block).
- **No Vitest test may import `src/lib/database/client.ts` or `src/lib/auth/config.ts`, even transitively.** Both call `getEnv()` at module load as a real side effect (this is intentional — it's what finally wires env validation into boot, closing the gap Phase 0 left open) — a test importing either would parse the real `process.env` in the test runner and fail unrelated tests. Code under test must accept `db`/`auth` as a parameter, or must not need them (pure logic only).
- Raw broadcast text, once Phase 4+ adds it, must stay immutable — not relevant to this phase's tables directly, but `broadcasts.rawText` must be defined as plain `text`, never given an `onUpdate` trigger or default that could imply mutation.
- Never invent a specification: every column in this plan's schema matches `docs/data-model.md` exactly, field for field.
- Seed scope for this phase is **one ADMIN user only** — not the fuller supplier/brand/product seed data, which belongs to the phases that build those modules' real UI (per `project_plan.md`'s phase table).
- Real UI design is out of scope — the login page and placeholder dashboard/admin pages are deliberately unstyled, same as Phase 0's approach.

## Review Focus

1. **`BETTER_AUTH_SECRET`'s placeholder is now actively rejected.** Phase 0's `env.ts` throws if `BETTER_AUTH_SECRET` is still `"replace-with-a-random-32-byte-secret"` — the value currently in every local `.env`. Nothing in this phase can boot until a real secret is generated. Task 1 generates one before touching anything else.
2. **Role authorization must be enforced on the actual protected page, not just in `middleware.ts`.** Middleware only checks for a session cookie's _presence_ (edge-safe, no DB round-trip) — it cannot verify the session is valid or check its role. A SUPPLIER who is logged in and hits `/admin` must be redirected away by the page itself, not waved through because _a_ cookie existed. Task 4's tests exercise this directly.
3. **Migrating against a Postgres container that reports "Up" but isn't accepting connections yet** — Phase 0's own Review Focus #4 already fixed the healthcheck race; this phase is the first to actually run a migration against it, so it's the first real proof that fix holds. Task 2 and Task 3 both wait for `healthy` before migrating, not just `docker compose up -d`.
4. **The seed script must not crash uninformatively on a second run.** `auth.api.signUpEmail` will reject a duplicate email; running `pnpm db:seed` twice (a very plausible mistake) must report "admin already exists" and exit cleanly, not throw a raw stack trace.
5. **A self-referencing FK (`categories.parentId`) and cross-module FKs (`suppliers.userId` → `users.id`, `broadcast_items.matchedProductId` → `products.id`, etc.) must resolve correctly.** Drizzle needs the `AnyPgColumn` type-lazy pattern for the self-reference, and the domain schema (Task 3) must run _after_ Better Auth's schema (Task 2) exists, or `suppliers.userId`'s FK target won't exist yet. Task 3's steps depend on Task 2's `users` table.

---

### Task 1: Drizzle + Postgres client, wired to `getEnv()`

**Files:**

- Create: `drizzle.config.ts`, `src/lib/database/client.ts`, `src/lib/database/schema.ts` (empty barrel for now)
- Modify: `package.json` (dependencies, `db:generate`/`db:migrate` scripts)

**Interfaces:**

- Consumes: `getEnv()` from `src/lib/validation/env.ts` (Phase 0).
- Produces: `db` (a Drizzle client) from `src/lib/database/client.ts` — every later task's schema/service code imports this. **Do not import this file from any Vitest test** (Global Constraints).

- [ ] **Step 1: Generate a real local secret (the placeholder is now rejected)**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output into your local `.env`'s `BETTER_AUTH_SECRET` (not `.env.example` — that file keeps the placeholder on purpose, per Phase 0's env test suite).

- [ ] **Step 2: Install Drizzle, the Postgres driver, and drizzle-kit**

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit tsx
```

- [ ] **Step 3: Create the schema barrel (empty for now)**

`src/lib/database/schema.ts`:

```ts
// Re-exports every module's schema so drizzle() gets one combined object
// for its relational query API. Tasks 2 and 3 append to this as they add
// each module's tables.
export {};
```

- [ ] **Step 4: Create the Drizzle client**

`src/lib/database/client.ts`:

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/lib/validation/env";
import * as schema from "./schema";

const queryClient = postgres(getEnv().DATABASE_URL);

export const db = drizzle(queryClient, { schema });
```

- [ ] **Step 5: Create `drizzle.config.ts`**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/modules/*/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Note: `drizzle-kit` reads `.env` itself (it doesn't go through our `getEnv()` — it's a CLI, not app code), so a local `.env` with a valid `DATABASE_URL` must exist, which it already does from Phase 0.

- [ ] **Step 6: Add scripts**

`package.json`:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

- [ ] **Step 7: Verify the client actually connects**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
docker compose ps
```

Expected: both services `healthy`.

```bash
pnpm tsx -e "
import { db } from './src/lib/database/client';
import postgres from 'postgres';
const client = postgres(process.env.DATABASE_URL!);
client\`select 1 as ok\`.then((r) => { console.log('OK:', r); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });
"
```

Expected: prints `OK: [ { ok: 1 } ]`.

```bash
pnpm build
```

Expected: build succeeds (nothing imports `client.ts` from a route yet, but this confirms nothing broke).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Drizzle client wired to getEnv(), drizzle-kit config"
```

---

### Task 2: Better Auth (users/sessions/accounts, role enum, API route)

**Files:**

- Create: `src/lib/auth/config.ts`, `src/lib/auth/client.ts`, `src/modules/auth/schema.ts` (generated, then hand-edited), `src/app/api/auth/[...all]/route.ts`
- Modify: `src/lib/database/schema.ts` (barrel), `.env.example`, `src/lib/validation/env.ts` (no new fields needed — `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` already exist from Phase 0)

**Interfaces:**

- Consumes: `db` from Task 1, `getEnv()` from Phase 0.
- Produces: `auth` (server instance) from `src/lib/auth/config.ts`; `authClient` from `src/lib/auth/client.ts`; the `users` table (with a `role` column, enum `ADMIN` | `SUPPLIER`, default `SUPPLIER`) that Task 3's `suppliers.userId` references.

- [ ] **Step 1: Install Better Auth**

```bash
pnpm add better-auth
```

- [ ] **Step 2: Write the server config**

`src/lib/auth/config.ts`:

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/database/client";
import { getEnv } from "@/lib/validation/env";

const env = getEnv();

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "SUPPLIER",
        input: false,
      },
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
});
```

`input: false` means a client cannot set their own role at signup — the seed script (Task 5) sets `ADMIN` with a direct database update after creating the account.

- [ ] **Step 3: Generate the auth schema via Better Auth's own CLI**

```bash
pnpm dlx @better-auth/cli@latest generate --config src/lib/auth/config.ts --output src/modules/auth/schema.ts -y
```

If this exact invocation errors on the installed version, run
`pnpm dlx @better-auth/cli@latest generate --help` to check the current
flag names and retry — CLI surfaces shift between versions, but the
`--config`/`--output` shape has been stable.

Expected: `src/modules/auth/schema.ts` created, containing `user`, `session`, and `account` tables (naming may be singular or plural depending on version — check the generated file and use its exact exported names in the next step).

- [ ] **Step 4: Make `role` a real Postgres enum**

Open the generated `src/modules/auth/schema.ts`. Find the `role` column on the user table (it will be generated as a plain `text("role")`). Add a `pgEnum` above the table definition and swap the column to use it:

```ts
import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "SUPPLIER"]);
```

Replace the generated `role: text("role")...` line with:

```ts
  role: userRoleEnum("role").notNull().default("SUPPLIER"),
```

(Keep every other generated column as-is — `id`, `email`, `emailVerified`, `name`, `image`, `createdAt`, `updatedAt` on the user table, and whatever the CLI generated for `session`/`account`.)

- [ ] **Step 5: Populate the schema barrel**

`src/lib/database/schema.ts`:

```ts
export * from "@/modules/auth/schema";
```

- [ ] **Step 6: API route handler**

`src/app/api/auth/[...all]/route.ts`:

```ts
import { auth } from "@/lib/auth/config";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 7: Client auth instance**

`src/lib/auth/client.ts`:

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
```

- [ ] **Step 8: Generate and apply the migration**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm db:generate
pnpm db:migrate
```

Expected: a new SQL file appears under `drizzle/`, and `db:migrate` reports it applied with no errors.

- [ ] **Step 9: Verify the tables exist**

```bash
docker compose exec -T postgres psql -U souqfeed -d souqfeed -c "\dt"
```

Expected: a table list including the user/session/account tables (exact names per Step 3's CLI output).

```bash
docker compose exec -T postgres psql -U souqfeed -d souqfeed -c "\d+ \"user\"" 2>/dev/null || docker compose exec -T postgres psql -U souqfeed -d souqfeed -c "\d+ users"
```

Expected: the `role` column shows type `user_role` (the enum), not `text`.

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: wire up Better Auth (email/password, ADMIN/SUPPLIER role enum)"
```

---

### Task 3: Domain schema (brands, categories, suppliers, products, broadcasts, offers, analytics)

**Files:**

- Create: `src/modules/brands/schema.ts`, `src/modules/categories/schema.ts`, `src/modules/suppliers/schema.ts`, `src/modules/products/schema.ts`, `src/modules/broadcasts/schema.ts`, `src/modules/offers/schema.ts`, `src/modules/analytics/schema.ts`
- Modify: `src/lib/database/schema.ts` (barrel)

**Interfaces:**

- Consumes: `users` table from Task 2 (`suppliers.userId` references it).
- Produces: every table in `docs/data-model.md`, ready for later phases' `service.ts`/`queries.ts` files to import from `@/modules/<name>/schema`.

- [ ] **Step 1: Brands**

`src/modules/brands/schema.ts`:

```ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

- [ ] **Step 2: Categories (self-referencing hierarchy)**

`src/modules/categories/schema.ts`:

```ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: uuid("parent_id").references((): AnyPgColumn => categories.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

- [ ] **Step 3: Suppliers (+ supplier_brands, supplier_categories)**

`src/modules/suppliers/schema.ts`:

```ts
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "@/modules/auth/schema";
import { brands } from "@/modules/brands/schema";
import { categories } from "@/modules/categories/schema";

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => user.id),
  companyName: text("company_name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  description: text("description"),
  whatsappNumber: text("whatsapp_number").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  locationName: text("location_name"),
  address: text("address"),
  googleMapsUrl: text("google_maps_url"),
  verified: boolean("verified").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const supplierBrands = pgTable(
  "supplier_brands",
  {
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
  },
  (table) => [primaryKey({ columns: [table.supplierId, table.brandId] })],
);

export const supplierCategories = pgTable(
  "supplier_categories",
  {
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (table) => [primaryKey({ columns: [table.supplierId, table.categoryId] })],
);
```

**Check Step 3's Note first:** confirm what Task 2's generated schema actually named the user table export (`user` singular is Better Auth's usual default — if Step 9 of Task 2 showed a different name, e.g. `users`, use that name in this import instead).

- [ ] **Step 4: Products (+ product_aliases)**

`src/modules/products/schema.ts`:

```ts
import {
  pgTable,
  uuid,
  text,
  jsonb,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { brands } from "@/modules/brands/schema";
import { categories } from "@/modules/categories/schema";

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    categoryId: uuid("category_id").references(() => categories.id),
    family: text("family"),
    model: text("model"),
    partNumber: text("part_number"),
    title: text("title").notNull(),
    normalizedTitle: text("normalized_title").notNull(),
    specifications: jsonb("specifications"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("products_brand_id_idx").on(table.brandId),
    index("products_category_id_idx").on(table.categoryId),
    index("products_part_number_idx").on(table.partNumber),
  ],
);

export const productAliases = pgTable(
  "product_aliases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    alias: text("alias").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("product_aliases_product_id_idx").on(table.productId),
    index("product_aliases_alias_idx").on(table.alias),
  ],
);
```

(The GIN trigram indexes on `title`/`normalizedTitle` from `docs/data-model.md` need the `pg_trgm` extension enabled first — that's Phase 9's job when search is actually built; the plain btree indexes above are what this phase needs.)

- [ ] **Step 5: Broadcasts (+ broadcast_items)**

`src/modules/broadcasts/schema.ts`:

```ts
import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  jsonb,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { suppliers } from "@/modules/suppliers/schema";
import { products } from "@/modules/products/schema";

export const broadcastStatusEnum = pgEnum("broadcast_status", [
  "DRAFT",
  "PROCESSING",
  "REVIEW",
  "PUBLISHED",
  "FAILED",
]);

export const broadcastSourceEnum = pgEnum("broadcast_source", [
  "MANUAL",
  "WHATSAPP",
  "EMAIL",
  "API",
]);

export const priceTypeEnum = pgEnum("price_type", [
  "FIXED",
  "ASK",
  "HIDDEN",
  "UNKNOWN",
]);

export const matchMethodEnum = pgEnum("match_method", [
  "PART_NUMBER",
  "SKU",
  "BRAND_MODEL",
  "ALIAS",
  "BRAND_FAMILY_SPEC",
  "FUZZY",
  "AI",
  "NONE",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "AUTO_APPROVED",
  "NEEDS_REVIEW",
  "APPROVED",
  "REJECTED",
]);

export const broadcasts = pgTable(
  "broadcasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    rawText: text("raw_text").notNull(),
    status: broadcastStatusEnum("status").notNull().default("DRAFT"),
    source: broadcastSourceEnum("source").notNull().default("MANUAL"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("broadcasts_supplier_id_idx").on(table.supplierId),
    index("broadcasts_created_at_idx").on(table.createdAt),
    index("broadcasts_status_idx").on(table.status),
  ],
);

export const broadcastItems = pgTable(
  "broadcast_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    broadcastId: uuid("broadcast_id")
      .notNull()
      .references(() => broadcasts.id),
    rawLine: text("raw_line").notNull(),
    rawBlock: text("raw_block"),

    detectedBrand: text("detected_brand"),
    detectedModel: text("detected_model"),
    detectedPartNumber: text("detected_part_number"),
    detectedCPU: text("detected_cpu"),
    detectedRAM: text("detected_ram"),
    detectedStorage: text("detected_storage"),
    detectedGPU: text("detected_gpu"),
    detectedDisplay: text("detected_display"),
    detectedOS: text("detected_os"),

    detectedQuantity: integer("detected_quantity"),
    detectedPrice: numeric("detected_price"),
    detectedCurrency: text("detected_currency").default("AED"),
    priceType: priceTypeEnum("price_type"),

    matchedProductId: uuid("matched_product_id").references(() => products.id),
    matchConfidence: numeric("match_confidence"),
    matchMethod: matchMethodEnum("match_method"),
    matchReasons: jsonb("match_reasons"),

    reviewStatus: reviewStatusEnum("review_status"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("broadcast_items_broadcast_id_idx").on(table.broadcastId),
    index("broadcast_items_matched_product_id_idx").on(table.matchedProductId),
    index("broadcast_items_review_status_idx").on(table.reviewStatus),
  ],
);
```

- [ ] **Step 6: Offers (+ offer_observations)**

`src/modules/offers/schema.ts`:

```ts
import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  jsonb,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { suppliers } from "@/modules/suppliers/schema";
import { products } from "@/modules/products/schema";
import { broadcastItems, priceTypeEnum } from "@/modules/broadcasts/schema";

export const availabilityStatusEnum = pgEnum("availability_status", [
  "AVAILABLE",
  "LIMITED",
  "ASK",
  "UNKNOWN",
  "SOLD_OUT",
]);

export const offers = pgTable(
  "offers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    broadcastItemId: uuid("broadcast_item_id")
      .notNull()
      .references(() => broadcastItems.id),
    titleSnapshot: text("title_snapshot"),
    specificationSnapshot: jsonb("specification_snapshot"),
    price: numeric("price"),
    currency: text("currency").default("AED"),
    priceType: priceTypeEnum("price_type"),
    quantity: integer("quantity"),
    availabilityStatus: availabilityStatusEnum("availability_status"),
    lastVerifiedAt: timestamp("last_verified_at"),
    publishedAt: timestamp("published_at"),
    expiresAt: timestamp("expires_at"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("offers_supplier_id_idx").on(table.supplierId),
    index("offers_product_id_idx").on(table.productId),
    index("offers_published_at_idx").on(table.publishedAt),
    index("offers_active_idx").on(table.active),
    uniqueIndex("offers_supplier_product_active_unique_idx")
      .on(table.supplierId, table.productId)
      .where(sql`${table.active} = true`),
  ],
);
```

The partial unique index (`WHERE active = true`) needs a raw `SQL`
expression — Drizzle's `uniqueIndex().where()` takes that, not a column
comparison directly, which is what the `sql` import above is for.

Then add `offer_observations` to the same file:

```ts
export const offerObservations = pgTable(
  "offer_observations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => offers.id),
    price: numeric("price"),
    currency: text("currency"),
    quantity: integer("quantity"),
    availabilityStatus: availabilityStatusEnum("availability_status"),
    observedAt: timestamp("observed_at").notNull().defaultNow(),
    broadcastItemId: uuid("broadcast_item_id")
      .notNull()
      .references(() => broadcastItems.id),
  },
  (table) => [
    index("offer_observations_offer_id_idx").on(table.offerId),
    index("offer_observations_observed_at_idx").on(table.observedAt),
  ],
);
```

- [ ] **Step 7: Analytics events**

`src/modules/analytics/schema.ts`:

```ts
import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { suppliers } from "@/modules/suppliers/schema";
import { products } from "@/modules/products/schema";
import { offers } from "@/modules/offers/schema";

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type").notNull(),
    supplierId: uuid("supplier_id").references(() => suppliers.id),
    productId: uuid("product_id").references(() => products.id),
    offerId: uuid("offer_id").references(() => offers.id),
    query: text("query"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("analytics_events_event_type_idx").on(table.eventType),
    index("analytics_events_created_at_idx").on(table.createdAt),
    index("analytics_events_supplier_id_idx").on(table.supplierId),
  ],
);
```

- [ ] **Step 8: Populate the schema barrel**

`src/lib/database/schema.ts`:

```ts
export * from "@/modules/auth/schema";
export * from "@/modules/brands/schema";
export * from "@/modules/categories/schema";
export * from "@/modules/suppliers/schema";
export * from "@/modules/products/schema";
export * from "@/modules/broadcasts/schema";
export * from "@/modules/offers/schema";
export * from "@/modules/analytics/schema";
```

- [ ] **Step 9: Generate and apply the migration**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm db:generate
pnpm db:migrate
```

Expected: a new migration file, applied cleanly.

- [ ] **Step 10: Verify every table exists**

```bash
docker compose exec -T postgres psql -U souqfeed -d souqfeed -c "\dt"
```

Expected output includes: `brands`, `categories`, `suppliers`, `supplier_brands`, `supplier_categories`, `products`, `product_aliases`, `broadcasts`, `broadcast_items`, `offers`, `offer_observations`, `analytics_events` (plus the auth tables from Task 2).

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add full domain schema (suppliers, brands, categories, products, broadcasts, offers, analytics)"
```

---

### Task 4: Role guards + middleware + placeholder protected pages (TDD for the pure logic)

**Files:**

- Create: `src/modules/auth/guards.ts`, `src/modules/auth/guards.test.ts`, `src/lib/auth/session.ts`, `middleware.ts`, `src/app/dashboard/page.tsx`, `src/app/admin/page.tsx`

**Interfaces:**

- Consumes: `auth` from Task 2 (only inside `session.ts`, never inside `guards.ts` — see Global Constraints).
- Produces: `authorizeRole(userRole, requiredRole): boolean` from `src/modules/auth/guards.ts` (pure, unit-tested); `getCurrentSession()` from `src/lib/auth/session.ts` (I/O, verified via Task 6's live curl flow, not Vitest).

- [ ] **Step 1: Write the failing test for the pure authorization logic**

`src/modules/auth/guards.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { authorizeRole } from "./guards";

describe("authorizeRole", () => {
  it("allows a matching role", () => {
    expect(authorizeRole("ADMIN", "ADMIN")).toBe(true);
  });

  it("denies a mismatched role", () => {
    expect(authorizeRole("SUPPLIER", "ADMIN")).toBe(false);
  });

  it("denies an undefined role", () => {
    expect(authorizeRole(undefined, "ADMIN")).toBe(false);
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

```bash
pnpm test
```

Expected: FAIL — `src/modules/auth/guards.ts` does not exist yet.

- [ ] **Step 3: Implement `guards.ts`**

```ts
export type Role = "ADMIN" | "SUPPLIER";

export function authorizeRole(
  userRole: Role | string | undefined,
  requiredRole: Role,
): boolean {
  return userRole === requiredRole;
}
```

- [ ] **Step 4: Run it, verify it passes**

```bash
pnpm test
```

Expected: PASS — all 3 new tests green, plus the existing 12 from Phase 0 (15 total).

- [ ] **Step 5: Server-side session helper (not unit-tested — see Global Constraints)**

`src/lib/auth/session.ts`:

```ts
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}
```

- [ ] **Step 6: Middleware — cheap redirect only, not the security boundary**

`middleware.ts` (repo root, next to `package.json`):

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

- [ ] **Step 7: Placeholder protected pages — real role check happens here**

`src/app/dashboard/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "SUPPLIER")) {
    redirect("/login");
  }
  return (
    <main>
      <h1>Supplier Dashboard</h1>
      <p>Signed in as {session.user.email}</p>
    </main>
  );
}
```

`src/app/admin/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";

export default async function AdminPage() {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "ADMIN")) {
    redirect("/login");
  }
  return (
    <main>
      <h1>Admin Panel</h1>
      <p>Signed in as {session.user.email}</p>
    </main>
  );
}
```

Note: `session.user.role` — check Task 2 Step 4's generated type. If TypeScript
complains `role` doesn't exist on the session's user type, cast narrowly at
the call site (`(session.user as { role: string }).role`) rather than
widening `authorizeRole`'s signature — the additional field is real at
runtime (Better Auth's `additionalFields` config adds it), this is purely
a typing gap in the generated types.

- [ ] **Step 8: Verify build**

```bash
pnpm format && pnpm lint && pnpm test && pnpm build
```

Expected: all green (15/15 tests).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add role guards, middleware, and placeholder dashboard/admin pages"
```

---

### Task 5: Seed script (one admin user)

**Files:**

- Create: `src/lib/database/seed.ts`
- Modify: `src/lib/validation/env.ts`, `src/lib/validation/env.test.ts`, `.env.example`, `package.json` (`db:seed` script)

**Interfaces:**

- Consumes: `auth` (Task 2), `db` and `user`/`userRoleEnum`-bearing schema (Tasks 2-3), `getEnv()` (Phase 0).
- Produces: one row in `user` with `role = 'ADMIN'` after running `pnpm db:seed`.

- [ ] **Step 1: Add ADMIN_EMAIL/ADMIN_PASSWORD to the env schema (TDD)**

Add to `src/lib/validation/env.test.ts`, inside the existing `describe("parseEnv", ...)`:

```ts
it("defaults ADMIN_EMAIL and ADMIN_PASSWORD when not set", () => {
  const env = parseEnv(validEnv);
  expect(env.ADMIN_EMAIL).toBe("admin@souqfeed.local");
  expect(env.ADMIN_PASSWORD).toBe("changeme-admin-1234");
});

it("throws when ADMIN_PASSWORD is too short", () => {
  expect(() => parseEnv({ ...validEnv, ADMIN_PASSWORD: "short" })).toThrow(
    /ADMIN_PASSWORD/,
  );
});
```

- [ ] **Step 2: Run it, verify it fails**

```bash
pnpm test
```

Expected: FAIL — `env.ts`'s schema has no `ADMIN_EMAIL`/`ADMIN_PASSWORD` fields yet, so `env.ADMIN_EMAIL` is `undefined` and the too-short test doesn't throw.

- [ ] **Step 3: Add the fields to `env.ts`**

In `src/lib/validation/env.ts`, add to `envSchema`:

```ts
  ADMIN_EMAIL: z.string().email().default("admin@souqfeed.local"),
  ADMIN_PASSWORD: z.string().min(8).default("changeme-admin-1234"),
```

- [ ] **Step 4: Run it, verify it passes**

```bash
pnpm test
```

Expected: PASS — 17/17 tests (15 from Task 4 + 2 new).

- [ ] **Step 5: Add both to `.env.example`**

```
ADMIN_EMAIL=admin@souqfeed.local
ADMIN_PASSWORD=changeme-admin-1234
```

- [ ] **Step 6: Write the seed script**

`src/lib/database/seed.ts`:

```ts
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/database/client";
import { user } from "@/modules/auth/schema";
import { getEnv } from "@/lib/validation/env";

async function seed() {
  const env = getEnv();

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, env.ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Admin already exists: ${env.ADMIN_EMAIL}`);
    return;
  }

  await auth.api.signUpEmail({
    body: {
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      name: "Admin",
    },
  });

  await db
    .update(user)
    .set({ role: "ADMIN" })
    .where(eq(user.email, env.ADMIN_EMAIL));

  console.log(`Seeded admin: ${env.ADMIN_EMAIL}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

Note: use whatever the auth schema actually exports for the user table
(check Task 2 Step 3/4's output — `user` singular is assumed here, matching
Better Auth's usual default).

- [ ] **Step 7: Add the script**

`package.json`:

```json
"db:seed": "tsx src/lib/database/seed.ts"
```

- [ ] **Step 8: Run it twice — verify creation, then verify idempotency**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm db:seed
```

Expected: `Seeded admin: admin@souqfeed.local`.

```bash
docker compose exec -T postgres psql -U souqfeed -d souqfeed -c "select email, role from \"user\";"
```

Expected: one row, `admin@souqfeed.local | ADMIN`.

```bash
pnpm db:seed
```

Expected: `Admin already exists: admin@souqfeed.local` — exits 0, no stack trace (Review Focus #4).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add seed script for the admin user (idempotent)"
```

---

### Task 6: Minimal login page + end-to-end verification

**Files:**

- Create: `src/app/login/page.tsx`

**Interfaces:**

- Consumes: `authClient` from Task 2.
- Produces: a working `/login` page; no new exports for later tasks.

- [ ] **Step 1: Write the login page**

`src/app/login/page.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const { data, error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message ?? "Sign in failed");
      return;
    }

    const role = (data?.user as { role?: string } | undefined)?.role;
    router.push(role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <main>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
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
          required
        />
        {error && <p role="alert">{error}</p>}
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: End-to-end verification without a browser**

```bash
docker compose up -d
for i in $(seq 1 15); do
  docker compose ps --format json | grep -q '"Health":"healthy"' && break
  sleep 2
done
pnpm db:seed
pnpm dev > /tmp/dev-phase1.log 2>&1 &
DEVPID=$!
sleep 5

curl -s -c /tmp/cookies.txt -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@souqfeed.local","password":"changeme-admin-1234"}'
echo ""

curl -s -b /tmp/cookies.txt -o /dev/null -w "admin page status: %{http_code}\n" \
  http://localhost:3000/admin

curl -s -o /dev/null -w "admin page (no cookie) status: %{http_code}\n" \
  http://localhost:3000/admin

kill $DEVPID 2>/dev/null
wait $DEVPID 2>/dev/null
docker compose down
rm -f /tmp/cookies.txt
```

Expected: the sign-in call returns a JSON body with the user object (no
error); `admin page status: 200` with the cookie; `admin page (no cookie)
status: 307` (or `302`/`200`-after-redirect depending on how curl follows
it without `-L` — the key check is that it is **not** `200` without the
cookie, i.e. an unauthenticated request never sees the admin page).

**This is Review Focus #2's actual test**: an authenticated non-admin
would also need checking. Do it here too:

```bash
docker compose up -d
sleep 3
pnpm tsx -e "
import { auth } from './src/lib/auth/config';
import { db } from './src/lib/database/client';
import { user } from './src/modules/auth/schema';
import { eq } from 'drizzle-orm';

async function main() {
  await auth.api.signUpEmail({ body: { email: 'supplier@test.local', password: 'test-password-123', name: 'Test Supplier' } });
  const rows = await db.select().from(user).where(eq(user.email, 'supplier@test.local'));
  console.log('role after signup (should be SUPPLIER):', rows[0]?.role);
  process.exit(0);
}
main();
"
pnpm dev > /tmp/dev-phase1b.log 2>&1 &
DEVPID=$!
sleep 5
curl -s -c /tmp/cookies2.txt -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"supplier@test.local","password":"test-password-123"}' > /dev/null
curl -s -b /tmp/cookies2.txt -o /dev/null -w "admin page as SUPPLIER: %{http_code}\n" http://localhost:3000/admin
curl -s -b /tmp/cookies2.txt -o /dev/null -w "dashboard page as SUPPLIER: %{http_code}\n" http://localhost:3000/dashboard
kill $DEVPID 2>/dev/null
wait $DEVPID 2>/dev/null
docker compose down
rm -f /tmp/cookies2.txt
```

Expected: `role after signup (should be SUPPLIER): SUPPLIER`; a SUPPLIER
hitting `/admin` is redirected away (not `200`); the same SUPPLIER hitting
`/dashboard` gets `200`.

- [ ] **Step 3: Full suite check**

```bash
pnpm format && pnpm lint && pnpm test && pnpm build
```

Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add minimal login page, verify role-based access end-to-end"
```

---

### Task 7: Full-loop verification and status update

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

Expected: every command succeeds against a genuinely fresh volume — this
is the first time this phase's migrations have run against an empty
database from scratch (Tasks 2/3 ran incrementally against an
already-migrated one).

- [ ] **Step 2: Confirm no secrets tracked**

```bash
git status
git ls-files | grep -x '\.env' && echo "FAIL: .env is tracked" || echo "OK: .env not tracked"
```

- [ ] **Step 3: Update `current.md`**

Move Phase 1 items from "Next" into "Completed"; set "Next" to Phase 2
(Supplier Profiles).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: complete Phase 1 database + auth"
```

## Self-Review Notes

- **Spec coverage:** every table in `docs/data-model.md` has a task (auth tables: Task 2; domain tables: Task 3); Better Auth/Drizzle adapter/email-password/role decisions from the foundation spec are in Task 2; seed-one-admin scope matches `project_plan.md`'s phase table exactly (Task 5); minimal/unstyled login matches the same source (Task 6).
- **Type/name consistency:** `authorizeRole`, `getCurrentSession`, `auth`, `authClient`, `db`, `user` (auth schema) are the cross-task exports; every later task's code uses these exact names. Two names are conditional on Task 2's actual CLI output (the user table's export name) and flagged explicitly at each use site rather than assumed silently.
- **Review Focus:** #1 → Task 1 Step 1 (blocks everything until done). #2 → Task 4 (page-level checks) verified end-to-end in Task 6 Step 2 (SUPPLIER-vs-ADMIN test). #3 → every migration step waits for `healthy` before running. #4 → Task 5 Step 8 (run seed twice). #5 → Task 3's self-reference and cross-module FK ordering, resolved by sequencing Task 2 before Task 3.
- **No placeholders:** every step has runnable commands or complete file contents. The one explicitly flagged uncertainty (Better Auth CLI's exact generated table names, and its exact current flag surface) is handled with a concrete primary command plus a concrete diagnostic fallback (`--help`), not a TBD.
