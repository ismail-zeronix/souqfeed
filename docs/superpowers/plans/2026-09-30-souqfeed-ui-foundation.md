# SouqFeed UI Foundation (Phase 0.5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Live Market homepage and Supplier profile page with a fully-themed, responsive UI matching `ui-design-ideas/`'s mockups, backed by static mock data with a clean seam to swap in real queries once Phase 1+ land.

**Architecture:** Next.js App Router pages (`src/app/page.tsx`, `src/app/suppliers/[slug]/page.tsx`) compose domain components from `src/components/{layout,ui,market,suppliers}/`, which read view-model types and mock accessor functions from `src/modules/{suppliers,offers,brands,categories}/`. Filtering/sorting is plain client-side state driving two pure functions (`filterOffers`, `sortOffers`) that get real Vitest coverage; presentational components have no test framework (none is added — see Global Constraints) and are verified by type-checking plus a manual browser pass in the final task.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui components generated against this project's `@base-ui/react` primitives (not Radix), `lucide-react` icons, Vitest (pure-logic tests only).

**Spec:** `docs/superpowers/specs/2026-09-30-souqfeed-ui-foundation-design.md`

## Global Constraints

- Package manager is pnpm — never npm/yarn.
- No dark mode (explicit MVP non-goal per `docs/theme.md`).
- No new runtime dependencies beyond what this phase's Task 1 installs (shadcn primitives: badge, tabs, select, checkbox, input, sheet, separator, label — already generated in the working tree as untracked files, verified against this project's actual `@base-ui/react` API). No charting library (two small charts are hand-rolled SVG), no React Testing Library/jsdom, no URL-state library.
- `@base-ui/react` components use a `render` prop for polymorphic rendering (e.g. `<Button render={<Link href="..." />}>`), **not** Radix's `asChild` — verified directly against `node_modules/@base-ui/react` before writing this plan. Do not use `asChild` anywhere.
- Base UI `Checkbox.Root` renders a hidden native `<input>` alongside its visible span specifically for native `<label>` click-association — wrapping `<Label><Checkbox />Text</Label>` works exactly like a native checkbox+label pair. Confirmed from `node_modules/@base-ui/react/checkbox/root/CheckboxRoot.js`.
- Every mock-data field that mirrors a real `docs/data-model.md` field is treated as real; every field with no schema backing (positive-score %, price-movement %, trending-search counts, WTB request snippets, category-mix %, broadcast-activity counts, avg-response-time label) gets a `// placeholder — no backing schema field yet` comment at its type definition, per the spec's explicit decision to recreate these visually anyway.
- `live-market-card.tsx` is the one shared card component for both screens (`actionLabel` prop distinguishes "View Supplier" vs "View Product") — never fork it.
- Nav items other than "Live Market" (`Suppliers`, `Search`, `WTB`, `Insights`) stay visually present but unwired (no `href`, non-interactive styling). Do not build `/search`, `/wtb`, `/insights`, or a suppliers directory page in this phase. `Sign In` is a styled button with no handler.
- Filtering/sorting is plain `useState` + the pure `filterOffers`/`sortOffers` functions — no URL sync, no new state library. Phase 9 designs real search's own state strategy independently.
- No React Testing Library/jsdom is added. Presentational component tasks are verified by `pnpm exec tsc --noEmit` (must report no errors) during the task, and by a full manual `pnpm dev` browser pass against both mockups in the final task — per `docs/superpowers/specs/2026-09-30-souqfeed-ui-foundation-design.md`'s explicit call to not add a test-rendering dependency without a current problem it solves.
- Any component file that grows past one clear responsibility gets split before it grows further.

## Review Focus

1. **Unknown supplier slug at `/suppliers/[slug]` must 404, not crash or render blank.** `getMockSupplierBySlug` returning `undefined` must trigger Next.js's `notFound()` in the page — Task 4 tests the accessor, Task 13 tests the page's handling of it.
2. **`priceType: "ASK"` / `price: null` offers must render "ASK — Best price on request," never "AED null" or a `.toLocaleString()` crash on `null`.** Task 7's `formatPrice` helper and its test must cover this exact case.
3. **A filter/search combination matching zero offers must show an explicit empty state**, not a silently blank feed that looks broken. Task 9's `LiveMarketFeed` and Task 13's `SupplierOffersSection` both render one.
4. **Long content (long supplier names, many category tags, long spec lines) must wrap or truncate, not break the card's layout.** Task 7's card uses `flex-wrap`/`min-w-0` rather than fixed widths; verified visually in Task 14 with a deliberately long fixture name.
5. **On a small viewport, filters must still be reachable.** Hiding the desktop filter sidebar (`lg:hidden`) must not remove the only way to filter — Task 8's `FiltersSidebar` Sheet trigger is the mobile path; Task 14 verifies it at a mobile width.

---

### Task 1: Phase setup — docs, theme tokens, shadcn primitives

**Files:**

- Modify: `project_plan.md` (phase table)
- Modify: `current.md` ("Next" section)
- Modify: `src/app/globals.css` (theme tokens, font-sans fix)
- Verify/commit (already generated, untracked): `src/components/ui/{badge,tabs,select,checkbox,input,sheet,separator,label}.tsx`

**Interfaces:**

- Produces: `--color-live` / `--live` and `--color-info` / `--info` CSS custom properties, usable as Tailwind utilities `bg-live`, `text-live`, `bg-info`, `text-info` everywhere from Task 5 onward.

- [ ] **Step 1: Insert the Phase 0.5 row into `project_plan.md`'s phase table**

Edit the table in `project_plan.md` (the one starting `| Phase | Scope |`) to insert a new row immediately after the Phase 0 row:

```
| 0.5   | UI foundation: theme tokens, shared components, Live Market homepage + Supplier profile page against static mock data (`docs/superpowers/specs/2026-09-30-souqfeed-ui-foundation-design.md`) |
```

- [ ] **Step 2: Update `current.md`'s "Next" section**

Replace the "Next" section's first bullet (currently "Merge Phase 0 once the final review is clean.") — Phase 0 is already merged into `master` — with:

```markdown
## Next

- Phase 0.5: UI foundation — theme tokens, shared components, and the Live
  Market homepage + Supplier profile page against static mock data, per
  `docs/superpowers/specs/2026-09-30-souqfeed-ui-foundation-design.md` and
  `docs/superpowers/plans/2026-09-30-souqfeed-ui-foundation.md`.
- Phase 1 (DB schema + Better Auth) follows once Phase 0.5 is verified —
  plan already written at `docs/superpowers/plans/2026-09-30-phase1-database-auth.md`.
```

- [ ] **Step 3: Apply theme tokens in `src/app/globals.css`**

In the `@theme inline` block, fix the self-referential font mapping and add the two new color tokens:

```css
--font-sans: var(--font-geist-sans);
```

(replaces the existing `--font-sans: var(--font-sans);` line)

Add these two lines to the same `@theme inline` block, near the other `--color-*` entries:

```css
--color-live: var(--live);
--color-info: var(--info);
```

In the `:root` block, replace the shadcn default neutral values with SouqFeed's brand tokens:

```css
--background: #f7f6f3;
--foreground: #16181a;
--card: #ffffff;
--card-foreground: #16181a;
--popover: #ffffff;
--popover-foreground: #16181a;
--primary: #0f6b45;
--primary-foreground: #ffffff;
--secondary: #f1f0ec;
--secondary-foreground: #16181a;
--muted: #f1f0ec;
--muted-foreground: #6b7280;
--accent: #e6f2ec;
--accent-foreground: #0f6b45;
--destructive: #dc2626;
--border: #e5e3de;
--input: #e5e3de;
--ring: #0f6b45;
--live: #16a34a;
--info: #2a5c8a;
```

Leave `--chart-*`, `--sidebar-*`, and `--radius` as-is — nothing in this phase uses them. Leave the `.dark` block untouched (dark mode is out of scope).

- [ ] **Step 4: Verify the shadcn primitives already in the working tree**

Run: `git status --short src/components/ui/`
Expected: eight untracked files — `badge.tsx`, `tabs.tsx`, `select.tsx`, `checkbox.tsx`, `input.tsx`, `sheet.tsx`, `separator.tsx`, `label.tsx`. These were generated via `pnpm exec shadcn add badge tabs select checkbox input sheet separator label --yes` and already verified against this project's `@base-ui/react` version — do not regenerate them.

- [ ] **Step 5: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors (these are generated files plus CSS-only changes; nothing references the new components yet).

- [ ] **Step 6: Commit**

```bash
git add project_plan.md current.md src/app/globals.css src/components/ui/badge.tsx src/components/ui/tabs.tsx src/components/ui/select.tsx src/components/ui/checkbox.tsx src/components/ui/input.tsx src/components/ui/sheet.tsx src/components/ui/separator.tsx src/components/ui/label.tsx
git commit -m "chore: add Phase 0.5 to roadmap, apply SouqFeed theme tokens, add shadcn primitives"
```

---

### Task 2: `categories` and `brands` modules

**Files:**

- Create: `src/modules/categories/types.ts`
- Create: `src/modules/categories/mock-data.ts`
- Create: `src/modules/categories/mock-data.test.ts`
- Create: `src/modules/brands/types.ts`
- Create: `src/modules/brands/mock-data.ts`
- Create: `src/modules/brands/mock-data.test.ts`

**Interfaces:**

- Produces: `Category { id, name, slug, offerCount }`, `getMockCategories(): Category[]`; `Brand { id, name, slug }`, `getMockBrands(): Brand[]`. Task 3 (offers) references these `id` values as `categoryId`/`brandId` foreign keys in its own mock fixtures — the ids must match exactly.

- [ ] **Step 1: Write the failing tests**

`src/modules/categories/mock-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getMockCategories } from "./mock-data";

describe("getMockCategories", () => {
  it("returns a non-empty list of categories with positive offer counts", () => {
    const categories = getMockCategories();
    expect(categories.length).toBeGreaterThan(0);
    for (const category of categories) {
      expect(category.offerCount).toBeGreaterThan(0);
    }
  });

  it("returns unique slugs", () => {
    const slugs = getMockCategories().map((category) => category.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
```

`src/modules/brands/mock-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getMockBrands } from "./mock-data";

describe("getMockBrands", () => {
  it("returns a non-empty list of brands with unique slugs", () => {
    const brands = getMockBrands();
    expect(brands.length).toBeGreaterThan(0);
    const slugs = brands.map((brand) => brand.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run src/modules/categories/mock-data.test.ts src/modules/brands/mock-data.test.ts`
Expected: FAIL — `mock-data.ts` does not exist in either module yet.

- [ ] **Step 3: Implement `categories`**

`src/modules/categories/types.ts`:

```ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  offerCount: number;
}
```

`src/modules/categories/mock-data.ts`:

```ts
import type { Category } from "./types";

const MOCK_CATEGORIES: Category[] = [
  { id: "cat-laptops", name: "Laptops", slug: "laptops", offerCount: 142 },
  { id: "cat-desktops", name: "Desktops", slug: "desktops", offerCount: 64 },
  { id: "cat-storage", name: "Storage", slug: "storage", offerCount: 86 },
  {
    id: "cat-networking",
    name: "Networking",
    slug: "networking",
    offerCount: 73,
  },
  {
    id: "cat-components",
    name: "Components",
    slug: "components",
    offerCount: 95,
  },
  { id: "cat-monitors", name: "Monitors", slug: "monitors", offerCount: 58 },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    offerCount: 124,
  },
  { id: "cat-software", name: "Software", slug: "software", offerCount: 18 },
];

export function getMockCategories(): Category[] {
  return MOCK_CATEGORIES;
}
```

- [ ] **Step 4: Implement `brands`**

`src/modules/brands/types.ts`:

```ts
export interface Brand {
  id: string;
  name: string;
  slug: string;
}
```

`src/modules/brands/mock-data.ts`:

```ts
import type { Brand } from "./types";

const MOCK_BRANDS: Brand[] = [
  { id: "brand-lenovo", name: "Lenovo", slug: "lenovo" },
  { id: "brand-hp", name: "HP", slug: "hp" },
  { id: "brand-dell", name: "Dell", slug: "dell" },
  { id: "brand-apple", name: "Apple", slug: "apple" },
  { id: "brand-acer", name: "Acer", slug: "acer" },
  { id: "brand-wd", name: "WD", slug: "wd" },
  { id: "brand-aruba", name: "Aruba", slug: "aruba" },
];

export function getMockBrands(): Brand[] {
  return MOCK_BRANDS;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm exec vitest run src/modules/categories/mock-data.test.ts src/modules/brands/mock-data.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/modules/categories src/modules/brands
git commit -m "feat: add categories and brands mock data modules"
```

---

### Task 3: `offers` module — types, mock data, `filterOffers`/`sortOffers`

**Files:**

- Create: `src/modules/offers/types.ts`
- Create: `src/modules/offers/mock-data.ts`
- Create: `src/modules/offers/filter-offers.ts`
- Create: `src/modules/offers/filter-offers.test.ts`

**Interfaces:**

- Consumes: `Category`/`Brand` `id` values from Task 2 (`cat-laptops`, `brand-lenovo`, etc.).
- Produces: `OfferListItem`, `OfferFilterCriteria`, `MarketStats` types; `EMPTY_OFFER_FILTERS`, `filterOffers(offers, criteria)`, `sortOffers(offers, sort)`, `getMockOffers()`, `getMockMarketStats()`. Every later task that renders an offer (Task 7's card, Task 9's feed, Task 13's supplier offers section) imports `OfferListItem` and these functions from here.

- [ ] **Step 1: Write the failing tests**

`src/modules/offers/filter-offers.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { EMPTY_OFFER_FILTERS, filterOffers, sortOffers } from "./filter-offers";
import type { OfferListItem } from "./types";

function makeOffer(overrides: Partial<OfferListItem>): OfferListItem {
  return {
    id: "offer-test",
    supplierId: "supplier-test",
    supplierName: "Test Supplier",
    supplierVerified: true,
    supplierSlug: "test-supplier",
    supplierPositiveScorePercent: 95,
    brandId: "brand-test",
    brandName: "TestBrand",
    categoryId: "cat-test",
    categoryName: "Test Category",
    locationName: "Bur Dubai",
    title: "Test Product",
    specLine: ["Spec A", "Spec B"],
    quantity: 10,
    price: 100,
    currency: "AED",
    priceType: "FIXED",
    previousPrice: null,
    availabilityStatus: "AVAILABLE",
    badge: null,
    postedAt: new Date().toISOString(),
    whatsappNumber: "+971500000000",
    ...overrides,
  };
}

describe("filterOffers", () => {
  it("returns all offers when criteria is empty", () => {
    const offers = [makeOffer({ id: "a" }), makeOffer({ id: "b" })];
    expect(filterOffers(offers, EMPTY_OFFER_FILTERS)).toHaveLength(2);
  });

  it("filters by brandIds", () => {
    const offers = [
      makeOffer({ id: "a", brandId: "brand-lenovo" }),
      makeOffer({ id: "b", brandId: "brand-hp" }),
    ];
    const result = filterOffers(offers, {
      ...EMPTY_OFFER_FILTERS,
      brandIds: ["brand-lenovo"],
    });
    expect(result.map((o) => o.id)).toEqual(["a"]);
  });

  it("filters by categoryIds", () => {
    const offers = [
      makeOffer({ id: "a", categoryId: "cat-laptops" }),
      makeOffer({ id: "b", categoryId: "cat-storage" }),
    ];
    const result = filterOffers(offers, {
      ...EMPTY_OFFER_FILTERS,
      categoryIds: ["cat-storage"],
    });
    expect(result.map((o) => o.id)).toEqual(["b"]);
  });

  it("filters by locationNames", () => {
    const offers = [
      makeOffer({ id: "a", locationName: "Bur Dubai" }),
      makeOffer({ id: "b", locationName: "Deira" }),
    ];
    const result = filterOffers(offers, {
      ...EMPTY_OFFER_FILTERS,
      locationNames: ["Deira"],
    });
    expect(result.map((o) => o.id)).toEqual(["b"]);
  });

  it("filters out-of-stock offers when inStockOnly is true", () => {
    const offers = [
      makeOffer({ id: "a", availabilityStatus: "AVAILABLE" }),
      makeOffer({ id: "b", availabilityStatus: "SOLD_OUT" }),
    ];
    const result = filterOffers(offers, {
      ...EMPTY_OFFER_FILTERS,
      inStockOnly: true,
    });
    expect(result.map((o) => o.id)).toEqual(["a"]);
  });

  it("matches searchQuery against title, brand, and spec line, case-insensitively", () => {
    const offers = [
      makeOffer({
        id: "a",
        title: "ThinkPad E14 Gen 7",
        brandName: "Lenovo",
        specLine: ["16GB RAM"],
      }),
      makeOffer({
        id: "b",
        title: "OptiPlex 7020",
        brandName: "Dell",
        specLine: ["8GB RAM"],
      }),
    ];
    const result = filterOffers(offers, {
      ...EMPTY_OFFER_FILTERS,
      searchQuery: "thinkpad",
    });
    expect(result.map((o) => o.id)).toEqual(["a"]);
  });

  it("combines multiple criteria with AND semantics", () => {
    const offers = [
      makeOffer({
        id: "a",
        brandId: "brand-lenovo",
        categoryId: "cat-laptops",
      }),
      makeOffer({
        id: "b",
        brandId: "brand-lenovo",
        categoryId: "cat-storage",
      }),
    ];
    const result = filterOffers(offers, {
      ...EMPTY_OFFER_FILTERS,
      brandIds: ["brand-lenovo"],
      categoryIds: ["cat-laptops"],
    });
    expect(result.map((o) => o.id)).toEqual(["a"]);
  });

  it("returns an empty array when nothing matches", () => {
    const offers = [makeOffer({ id: "a", brandId: "brand-lenovo" })];
    const result = filterOffers(offers, {
      ...EMPTY_OFFER_FILTERS,
      brandIds: ["brand-hp"],
    });
    expect(result).toEqual([]);
  });
});

describe("sortOffers", () => {
  it("sorts by most recent first", () => {
    const older = makeOffer({
      id: "old",
      postedAt: new Date(Date.now() - 100000).toISOString(),
    });
    const newer = makeOffer({ id: "new", postedAt: new Date().toISOString() });
    expect(sortOffers([older, newer], "recent").map((o) => o.id)).toEqual([
      "new",
      "old",
    ]);
  });

  it("sorts by price ascending, treating a null (ASK) price as highest", () => {
    const cheap = makeOffer({ id: "cheap", price: 100 });
    const askPrice = makeOffer({ id: "ask", price: null, priceType: "ASK" });
    const mid = makeOffer({ id: "mid", price: 500 });
    expect(
      sortOffers([mid, askPrice, cheap], "price-asc").map((o) => o.id),
    ).toEqual(["cheap", "mid", "ask"]);
  });

  it("sorts by price descending, treating a null (ASK) price as lowest", () => {
    const cheap = makeOffer({ id: "cheap", price: 100 });
    const askPrice = makeOffer({ id: "ask", price: null, priceType: "ASK" });
    const mid = makeOffer({ id: "mid", price: 500 });
    expect(
      sortOffers([cheap, askPrice, mid], "price-desc").map((o) => o.id),
    ).toEqual(["mid", "cheap", "ask"]);
  });

  it("does not mutate the input array", () => {
    const offers = [
      makeOffer({ id: "a", price: 500 }),
      makeOffer({ id: "b", price: 100 }),
    ];
    const original = [...offers];
    sortOffers(offers, "price-asc");
    expect(offers).toEqual(original);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run src/modules/offers/filter-offers.test.ts`
Expected: FAIL — `filter-offers.ts` and `types.ts` don't exist yet.

- [ ] **Step 3: Write `types.ts`**

`src/modules/offers/types.ts`:

```ts
export type PriceType = "FIXED" | "ASK" | "HIDDEN" | "UNKNOWN";
export type AvailabilityStatus =
  "AVAILABLE" | "LIMITED" | "ASK" | "UNKNOWN" | "SOLD_OUT";
export type OfferBadge = "NEW" | "LIVE" | "PRICE_UPDATED" | null;

export interface OfferListItem {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierVerified: boolean;
  supplierSlug: string;
  supplierPositiveScorePercent: number; // placeholder — no backing schema field yet
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  locationName: string;
  title: string;
  specLine: string[];
  quantity: number | null;
  price: number | null;
  currency: string;
  priceType: PriceType;
  previousPrice: number | null; // real: derived from the most recent prior offer_observations row
  availabilityStatus: AvailabilityStatus;
  badge: OfferBadge;
  postedAt: string; // ISO timestamp
  whatsappNumber: string;
}

export interface OfferFilterCriteria {
  brandIds: string[];
  categoryIds: string[];
  locationNames: string[];
  inStockOnly: boolean;
  searchQuery: string;
}

export interface MarketStats {
  // placeholder — no backing aggregation query yet; Phase 12 (analytics) computes these for real
  activeSuppliersToday: number;
  activeSuppliersTrendPercent: number;
  offersPostedToday: number;
  offersPostedTrendPercent: number;
  priceUpdatesToday: number;
  priceUpdatesTrendPercent: number;
  newProductsToday: number;
  newProductsTrendPercent: number;
}
```

- [ ] **Step 4: Write `filter-offers.ts`**

`src/modules/offers/filter-offers.ts`:

```ts
import type { OfferFilterCriteria, OfferListItem } from "./types";

export const EMPTY_OFFER_FILTERS: OfferFilterCriteria = {
  brandIds: [],
  categoryIds: [],
  locationNames: [],
  inStockOnly: false,
  searchQuery: "",
};

export function filterOffers(
  offers: OfferListItem[],
  criteria: OfferFilterCriteria,
): OfferListItem[] {
  const query = criteria.searchQuery.trim().toLowerCase();

  return offers.filter((offer) => {
    if (
      criteria.brandIds.length > 0 &&
      !criteria.brandIds.includes(offer.brandId)
    ) {
      return false;
    }
    if (
      criteria.categoryIds.length > 0 &&
      !criteria.categoryIds.includes(offer.categoryId)
    ) {
      return false;
    }
    if (
      criteria.locationNames.length > 0 &&
      !criteria.locationNames.includes(offer.locationName)
    ) {
      return false;
    }
    if (criteria.inStockOnly && offer.availabilityStatus !== "AVAILABLE") {
      return false;
    }
    if (query.length > 0) {
      const haystack =
        `${offer.title} ${offer.brandName} ${offer.specLine.join(" ")}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });
}

export type SortOption = "recent" | "price-asc" | "price-desc";

export function sortOffers(
  offers: OfferListItem[],
  sort: SortOption,
): OfferListItem[] {
  const copy = [...offers];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    case "price-desc":
      return copy.sort(
        (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
      );
    case "recent":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
      );
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm exec vitest run src/modules/offers/filter-offers.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 6: Write `mock-data.ts`**

`src/modules/offers/mock-data.ts`:

```ts
import type { MarketStats, OfferListItem } from "./types";

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

const MOCK_OFFERS: OfferListItem[] = [
  {
    id: "offer-1",
    supplierId: "supplier-al-hadi",
    supplierName: "Al Hadi Computers LLC",
    supplierVerified: true,
    supplierSlug: "al-hadi-computers",
    supplierPositiveScorePercent: 98,
    brandId: "brand-lenovo",
    brandName: "Lenovo",
    categoryId: "cat-laptops",
    categoryName: "Laptops",
    locationName: "Bur Dubai",
    title: "Lenovo ThinkPad E14 Gen 7",
    specLine: [
      "Intel Core Ultra 7 155H",
      "16GB RAM",
      "512GB SSD",
      '14" FHD',
      "Win 11 Pro",
    ],
    quantity: 120,
    price: 3850,
    currency: "AED",
    priceType: "FIXED",
    previousPrice: null,
    availabilityStatus: "AVAILABLE",
    badge: "NEW",
    postedAt: minutesAgo(2),
    whatsappNumber: "+971543210001",
  },
  {
    id: "offer-2",
    supplierId: "supplier-skyline",
    supplierName: "Skyline General Trading",
    supplierVerified: true,
    supplierSlug: "skyline-general-trading",
    supplierPositiveScorePercent: 97,
    brandId: "brand-hp",
    brandName: "HP",
    categoryId: "cat-laptops",
    categoryName: "Laptops",
    locationName: "Bur Dubai",
    title: "HP 250 G10",
    specLine: [
      "Intel Core i5-1335U",
      "8GB RAM",
      "512GB SSD",
      '15.6" FHD',
      "DOS",
    ],
    quantity: 70,
    price: null,
    currency: "AED",
    priceType: "ASK",
    previousPrice: null,
    availabilityStatus: "AVAILABLE",
    badge: "LIVE",
    postedAt: minutesAgo(8),
    whatsappNumber: "+971543210002",
  },
  {
    id: "offer-3",
    supplierId: "supplier-microlink",
    supplierName: "Microlink Technology LLC",
    supplierVerified: true,
    supplierSlug: "microlink-technology",
    supplierPositiveScorePercent: 99,
    brandId: "brand-wd",
    brandName: "WD",
    categoryId: "cat-storage",
    categoryName: "Storage",
    locationName: "Bur Dubai",
    title: "WD Purple 8TB Surveillance HDD",
    specLine: ['3.5"', "SATA III", "256MB Cache", "For CCTV", "WD82PURZ"],
    quantity: 50,
    price: 540,
    currency: "AED",
    priceType: "FIXED",
    previousPrice: 570,
    availabilityStatus: "AVAILABLE",
    badge: "PRICE_UPDATED",
    postedAt: minutesAgo(12),
    whatsappNumber: "+971543210003",
  },
  {
    id: "offer-4",
    supplierId: "supplier-network-zone",
    supplierName: "Network Zone FZE",
    supplierVerified: true,
    supplierSlug: "network-zone",
    supplierPositiveScorePercent: 98,
    brandId: "brand-aruba",
    brandName: "Aruba",
    categoryId: "cat-networking",
    categoryName: "Networking",
    locationName: "Al Fahidi",
    title: "Aruba Instant On AP25 (R9B28A)",
    specLine: [
      "Wi-Fi 6",
      "Dual Band",
      "2x2:2 MIMO",
      "PoE",
      "Indoor Access Point",
    ],
    quantity: 20,
    price: null,
    currency: "AED",
    priceType: "ASK",
    previousPrice: null,
    availabilityStatus: "AVAILABLE",
    badge: "LIVE",
    postedAt: minutesAgo(18),
    whatsappNumber: "+971543210004",
  },
  {
    id: "offer-5",
    supplierId: "supplier-techno-source",
    supplierName: "Techno Source LLC",
    supplierVerified: true,
    supplierSlug: "techno-source",
    supplierPositiveScorePercent: 96,
    brandId: "brand-dell",
    brandName: "Dell",
    categoryId: "cat-desktops",
    categoryName: "Desktops",
    locationName: "Bur Dubai",
    title: "Dell OptiPlex 7020 SFF",
    specLine: [
      "Intel Core i7-14700",
      "16GB RAM",
      "512GB SSD",
      "Intel UHD",
      "Win 11 Pro",
    ],
    quantity: 40,
    price: 2950,
    currency: "AED",
    priceType: "FIXED",
    previousPrice: null,
    availabilityStatus: "AVAILABLE",
    badge: "LIVE",
    postedAt: minutesAgo(25),
    whatsappNumber: "+971543210005",
  },
  {
    id: "offer-6",
    supplierId: "supplier-seven-seas",
    supplierName: "Seven Seas Computers",
    supplierVerified: true,
    supplierSlug: "seven-seas-computers",
    supplierPositiveScorePercent: 99,
    brandId: "brand-apple",
    brandName: "Apple",
    categoryId: "cat-laptops",
    categoryName: "Laptops",
    locationName: "Deira",
    title: 'Apple MacBook Air 13" M3',
    specLine: [
      "Apple M3",
      "16GB RAM",
      "512GB SSD",
      '13.6" Liquid Retina',
      "macOS",
    ],
    quantity: 15,
    price: 4650,
    currency: "AED",
    priceType: "FIXED",
    previousPrice: null,
    availabilityStatus: "AVAILABLE",
    badge: "NEW",
    postedAt: minutesAgo(32),
    whatsappNumber: "+971543210006",
  },
];

const MOCK_MARKET_STATS: MarketStats = {
  activeSuppliersToday: 342,
  activeSuppliersTrendPercent: 12,
  offersPostedToday: 1284,
  offersPostedTrendPercent: 28,
  priceUpdatesToday: 756,
  priceUpdatesTrendPercent: 19,
  newProductsToday: 210,
  newProductsTrendPercent: 32,
};

export function getMockOffers(): OfferListItem[] {
  return MOCK_OFFERS;
}

export function getMockMarketStats(): MarketStats {
  return MOCK_MARKET_STATS;
}
```

- [ ] **Step 7: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/modules/offers
git commit -m "feat: add offers module with filterOffers/sortOffers and mock data"
```

---

### Task 4: `suppliers` module — types, mock data, `getMockSupplierBySlug`

**Files:**

- Create: `src/modules/suppliers/types.ts`
- Create: `src/modules/suppliers/mock-data.ts`
- Create: `src/modules/suppliers/mock-data.test.ts`

**Interfaces:**

- Consumes: nothing from earlier tasks (supplier slugs here must match the `supplierSlug` values already used in Task 3's `MOCK_OFFERS`: `al-hadi-computers`, `skyline-general-trading`, `microlink-technology`, `network-zone`, `techno-source`, `seven-seas-computers`).
- Produces: `SupplierSummary`, `SupplierProfile`, `TopBrandShare`, `CategoryMixSlice`, `BroadcastActivityDay` types; `getMockSuppliers(): SupplierSummary[]`, `getMockSupplierBySlug(slug): SupplierProfile | undefined`. Task 7 (card), Task 9 (market pulse), and Tasks 11–13 (supplier profile) all import from here.

- [ ] **Step 1: Write the failing tests**

`src/modules/suppliers/mock-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getMockSupplierBySlug, getMockSuppliers } from "./mock-data";

describe("getMockSupplierBySlug", () => {
  it("returns the matching supplier profile for a known slug", () => {
    const supplier = getMockSupplierBySlug("al-hadi-computers");
    expect(supplier?.companyName).toBe("Al Hadi Computers LLC");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getMockSupplierBySlug("does-not-exist")).toBeUndefined();
  });
});

describe("getMockSuppliers", () => {
  it("returns one summary per mock supplier, each with a positive activeOfferCount", () => {
    const suppliers = getMockSuppliers();
    expect(suppliers.length).toBeGreaterThanOrEqual(6);
    for (const supplier of suppliers) {
      expect(supplier.activeOfferCount).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run src/modules/suppliers/mock-data.test.ts`
Expected: FAIL — module doesn't exist yet.

- [ ] **Step 3: Write `types.ts`**

`src/modules/suppliers/types.ts`:

```ts
export interface SupplierSummary {
  id: string;
  slug: string;
  companyName: string;
  logoInitial: string;
  verified: boolean;
  locationName: string;
  activeOfferCount: number;
  positiveScorePercent: number; // placeholder — no backing schema field yet
}

export interface TopBrandShare {
  brandId: string;
  brandName: string;
  sharePercent: number;
}

export interface CategoryMixSlice {
  categoryId: string;
  categoryName: string;
  sharePercent: number; // placeholder — no backing schema field yet (category-mix chart deferred)
}

export interface BroadcastActivityDay {
  label: string;
  count: number; // placeholder — no backing schema field yet (broadcast-activity chart deferred)
}

export interface SupplierProfile extends SupplierSummary {
  description: string | null;
  whatsappNumber: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  tags: string[];
  lastBroadcastAt: string;
  memberSinceYear: number;
  avgResponseTimeLabel: string; // placeholder — no backing schema field yet
  topBrands: TopBrandShare[];
  categoryMix: CategoryMixSlice[];
  broadcastActivity: BroadcastActivityDay[];
  businessHours: { day: string; hours: string }[];
}
```

- [ ] **Step 4: Write `mock-data.ts`**

`src/modules/suppliers/mock-data.ts`:

```ts
import type { SupplierProfile, SupplierSummary } from "./types";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const AL_HADI: SupplierProfile = {
  id: "supplier-al-hadi",
  slug: "al-hadi-computers",
  companyName: "Al Hadi Computers LLC",
  logoInitial: "A",
  verified: true,
  locationName: "Bur Dubai",
  activeOfferCount: 320,
  positiveScorePercent: 98,
  description:
    "Al Hadi Computers LLC is a leading IT distributor based in Bur Dubai, specializing in laptops, desktops, components and enterprise solutions. We supply genuine products from global brands with competitive wholesale pricing.",
  whatsappNumber: "+971543521234",
  phone: "+97143526611",
  email: "sales@alhadi-computers.ae",
  address: "Bur Dubai, Dubai, UAE",
  googleMapsUrl: "https://maps.google.com/?q=Al+Hadi+Computers+Bur+Dubai",
  tags: [
    "Laptops",
    "Desktops",
    "Components",
    "Networking",
    "Accessories",
    "Software",
  ],
  lastBroadcastAt: hoursAgo(2),
  memberSinceYear: 2016,
  avgResponseTimeLabel: "< 2 hours",
  topBrands: [
    { brandId: "brand-lenovo", brandName: "Lenovo", sharePercent: 28 },
    { brandId: "brand-hp", brandName: "HP", sharePercent: 22 },
    { brandId: "brand-dell", brandName: "Dell", sharePercent: 18 },
    { brandId: "brand-apple", brandName: "Apple", sharePercent: 8 },
    { brandId: "brand-wd", brandName: "WD", sharePercent: 8 },
    { brandId: "brand-aruba", brandName: "Aruba", sharePercent: 6 },
  ],
  categoryMix: [
    { categoryId: "cat-laptops", categoryName: "Laptops", sharePercent: 42 },
    { categoryId: "cat-desktops", categoryName: "Desktops", sharePercent: 18 },
    { categoryId: "cat-storage", categoryName: "Storage", sharePercent: 14 },
    {
      categoryId: "cat-networking",
      categoryName: "Networking",
      sharePercent: 12,
    },
    {
      categoryId: "cat-components",
      categoryName: "Components",
      sharePercent: 8,
    },
    {
      categoryId: "cat-accessories",
      categoryName: "Accessories",
      sharePercent: 6,
    },
  ],
  broadcastActivity: [
    { label: "Mar 10", count: 18 },
    { label: "Mar 11", count: 22 },
    { label: "Mar 12", count: 15 },
    { label: "Mar 13", count: 48 },
    { label: "Mar 14", count: 30 },
    { label: "Mar 15", count: 26 },
    { label: "Mar 16", count: 34 },
  ],
  businessHours: [
    { day: "Mon - Fri", hours: "9:00 AM - 7:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 5:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
};

function supplierStub(
  id: string,
  slug: string,
  companyName: string,
  logoInitial: string,
  locationName: string,
  activeOfferCount: number,
  positiveScorePercent: number,
): SupplierProfile {
  return {
    ...AL_HADI,
    id,
    slug,
    companyName,
    logoInitial,
    locationName,
    activeOfferCount,
    positiveScorePercent,
  };
}

const MOCK_SUPPLIERS: SupplierProfile[] = [
  AL_HADI,
  supplierStub(
    "supplier-skyline",
    "skyline-general-trading",
    "Skyline General Trading",
    "S",
    "Bur Dubai",
    410,
    97,
  ),
  supplierStub(
    "supplier-microlink",
    "microlink-technology",
    "Microlink Technology LLC",
    "M",
    "Bur Dubai",
    892,
    99,
  ),
  supplierStub(
    "supplier-network-zone",
    "network-zone",
    "Network Zone FZE",
    "N",
    "Al Fahidi",
    225,
    98,
  ),
  supplierStub(
    "supplier-techno-source",
    "techno-source",
    "Techno Source LLC",
    "T",
    "Bur Dubai",
    310,
    96,
  ),
  supplierStub(
    "supplier-seven-seas",
    "seven-seas-computers",
    "Seven Seas Computers",
    "S",
    "Deira",
    187,
    99,
  ),
];

function toSummary(profile: SupplierProfile): SupplierSummary {
  const {
    id,
    slug,
    companyName,
    logoInitial,
    verified,
    locationName,
    activeOfferCount,
    positiveScorePercent,
  } = profile;
  return {
    id,
    slug,
    companyName,
    logoInitial,
    verified,
    locationName,
    activeOfferCount,
    positiveScorePercent,
  };
}

export function getMockSuppliers(): SupplierSummary[] {
  return MOCK_SUPPLIERS.map(toSummary);
}

export function getMockSupplierBySlug(
  slug: string,
): SupplierProfile | undefined {
  return MOCK_SUPPLIERS.find((supplier) => supplier.slug === slug);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm exec vitest run src/modules/suppliers/mock-data.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Type-check and commit**

Run: `pnpm exec tsc --noEmit` — expected no errors.

```bash
git add src/modules/suppliers
git commit -m "feat: add suppliers module with mock data and slug lookup"
```

---

### Task 5: Shared `ui/` primitives — `StatTile`, `SupplierLogoTile`, `SidebarWidget`

**Files:**

- Create: `src/components/ui/stat-tile.tsx`
- Create: `src/components/ui/supplier-logo-tile.tsx`
- Create: `src/components/ui/sidebar-widget.tsx`

**Interfaces:**

- Produces: `StatTile({ icon, value, label, trendPercent?, className? })`, `SupplierLogoTile({ initial, size?, className? })`, `SidebarWidget({ title, showViewAll?, liveIndicator?, children, className? })`. Consumed by every component task from Task 7 onward.

No test framework applies to pure presentation — verified by type-check here, and visually in Task 14.

- [ ] **Step 1: Write `stat-tile.tsx`**

```tsx
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatTileProps {
  icon: LucideIcon;
  value: string;
  label: string;
  trendPercent?: number;
  className?: string;
}

export function StatTile({
  icon: Icon,
  value,
  label,
  trendPercent,
  className,
}: StatTileProps) {
  const hasTrend = typeof trendPercent === "number";
  const isUp = hasTrend && trendPercent >= 0;

  return (
    <div
      className={cn(
        "border-border bg-card flex items-center gap-3 rounded-md border px-4 py-3",
        className,
      )}
    >
      <Icon className="text-muted-foreground size-5" aria-hidden />
      <div className="flex min-w-0 flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-foreground text-lg font-semibold tabular-nums">
            {value}
          </span>
          {hasTrend && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium tabular-nums",
                isUp ? "text-live" : "text-destructive",
              )}
            >
              {isUp ? (
                <ArrowUp className="size-3" aria-hidden />
              ) : (
                <ArrowDown className="size-3" aria-hidden />
              )}
              {Math.abs(trendPercent)}%
            </span>
          )}
        </div>
        <span className="text-muted-foreground truncate text-xs">{label}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `supplier-logo-tile.tsx`**

```tsx
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "size-9 text-sm",
  md: "size-12 text-base",
  lg: "size-20 text-2xl",
} as const;

export function SupplierLogoTile({
  initial,
  size = "md",
  className,
}: {
  initial: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-muted text-primary flex shrink-0 items-center justify-center rounded-md border font-semibold",
        SIZE_CLASSES[size],
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
```

- [ ] **Step 3: Write `sidebar-widget.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SidebarWidget({
  title,
  showViewAll = false,
  liveIndicator = false,
  children,
  className,
}: {
  title: string;
  showViewAll?: boolean;
  liveIndicator?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("border-border bg-card rounded-md border p-4", className)}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-sm font-semibold">{title}</h3>
          {liveIndicator && (
            <span className="text-live flex items-center gap-1 text-xs font-medium">
              <span className="bg-live size-1.5 rounded-full" aria-hidden />
              Live
            </span>
          )}
        </div>
        {showViewAll && (
          <span className="text-muted-foreground text-xs font-medium">
            View all
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/stat-tile.tsx src/components/ui/supplier-logo-tile.tsx src/components/ui/sidebar-widget.tsx
git commit -m "feat: add StatTile, SupplierLogoTile, and SidebarWidget primitives"
```

---

### Task 6: Site header + layout wiring

**Files:**

- Create: `src/components/layout/site-header.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**

- Produces: `<SiteHeader />`, no props. Task 10 and Task 13's pages render inside the `<main>` this task adds to `layout.tsx`.

- [ ] **Step 1: Write `site-header.tsx`**

```tsx
import Link from "next/link";
import { Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS: { label: string; href: string | null }[] = [
  { label: "Live Market", href: "/" },
  { label: "Suppliers", href: null },
  { label: "Search", href: null },
  { label: "WTB", href: null },
  { label: "Insights", href: null },
];

export function SiteHeader() {
  return (
    <header className="border-border bg-card border-b">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="text-foreground flex shrink-0 items-center gap-2 font-semibold"
        >
          <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded text-sm font-bold">
            S
          </span>
          SouqFeed
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_ITEMS.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="border-primary text-foreground border-b-2 py-4"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="text-muted-foreground cursor-default py-4"
                aria-disabled
              >
                {item.label}
              </span>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Bell className="text-muted-foreground size-5" aria-hidden />
          <Globe className="text-muted-foreground size-5" aria-hidden />
          <Button>Sign In</Button>
        </div>
      </div>
    </header>
  );
}
```

Note: the nav collapses to just the logo, icons, and Sign In on small screens (`hidden md:flex`) — no hamburger menu, since every nav item besides "Live Market" (the homepage itself) is unwired anyway. This is a deliberate simplification, not an oversight.

- [ ] **Step 2: Wire it into `layout.tsx` and set real metadata**

Replace the full contents of `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SouqFeed — Dubai IT Wholesale Market",
  description: "Real-time offers. Verified suppliers. Better sourcing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/site-header.tsx src/app/layout.tsx
git commit -m "feat: add site header and wire it into the root layout"
```

---

### Task 7: `MarketBadge` and the shared `LiveMarketCard`

Deviation from the spec's illustrative file list: the spec named this
component `ui/badge-status.tsx`. Task 1's primitive install revealed shadcn
already generates a generic `Badge` (`src/components/ui/badge.tsx`) for this
project's `@base-ui/react` setup, so this task builds a thin variant-mapping
wrapper on top of it instead of a standalone primitive, and places it under
`components/market/` since its three variants (NEW/LIVE/PRICE_UPDATED) are
offer-state semantics, not a generic UI primitive. Same intent as the spec,
different name/location.

**Files:**

- Create: `src/components/market/market-badge.tsx`
- Create: `src/components/market/live-market-card.tsx`
- Create: `src/components/market/live-market-card.test.ts` (pure `formatPrice`/`formatRelativeTime` logic only)

**Interfaces:**

- Consumes: `OfferListItem` (Task 3), `SupplierLogoTile` (Task 5), shadcn `Badge`/`Button` (Task 1).
- Produces: `<MarketBadge variant="NEW" | "LIVE" | "PRICE_UPDATED" />`; `<LiveMarketCard offer={OfferListItem} actionLabel?: "View Supplier" | "View Product" />` — the single card used by both Task 9 (homepage feed) and Task 13 (supplier offers section).

- [ ] **Step 1: Write the failing test for the pure price/time formatting logic**

`src/components/market/live-market-card.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatPrice, formatRelativeTime } from "./live-market-card";
import type { OfferListItem } from "@/modules/offers/types";

function makeOffer(overrides: Partial<OfferListItem>): OfferListItem {
  return {
    id: "offer-test",
    supplierId: "supplier-test",
    supplierName: "Test Supplier",
    supplierVerified: true,
    supplierSlug: "test-supplier",
    supplierPositiveScorePercent: 95,
    brandId: "brand-test",
    brandName: "TestBrand",
    categoryId: "cat-test",
    categoryName: "Test Category",
    locationName: "Bur Dubai",
    title: "Test Product",
    specLine: ["Spec A"],
    quantity: 10,
    price: 100,
    currency: "AED",
    priceType: "FIXED",
    previousPrice: null,
    availabilityStatus: "AVAILABLE",
    badge: null,
    postedAt: new Date().toISOString(),
    whatsappNumber: "+971500000000",
    ...overrides,
  };
}

describe("formatPrice", () => {
  it("renders ASK offers as 'ASK' with a request-price hint, never a null price", () => {
    const offer = makeOffer({ priceType: "ASK", price: null });
    const result = formatPrice(offer);
    expect(result.primary).toBe("ASK");
    expect(result.secondary).toBe("Best price on request");
  });

  it("renders a fixed price with the currency and thousands separators", () => {
    const offer = makeOffer({
      priceType: "FIXED",
      price: 3850,
      currency: "AED",
    });
    expect(formatPrice(offer).primary).toBe("AED 3,850");
  });

  it("shows the previous price when it is higher (a price drop)", () => {
    const offer = makeOffer({
      priceType: "FIXED",
      price: 540,
      previousPrice: 570,
    });
    expect(formatPrice(offer).secondary).toBe("Was 570");
  });

  it("shows a bulk-price hint for high-quantity fixed offers with no prior price", () => {
    const offer = makeOffer({
      priceType: "FIXED",
      price: 3850,
      quantity: 120,
      previousPrice: null,
    });
    expect(formatPrice(offer).secondary).toBe("Bulk price available");
  });
});

describe("formatRelativeTime", () => {
  it("formats minutes for anything under an hour", () => {
    expect(
      formatRelativeTime(new Date(Date.now() - 2 * 60_000).toISOString()),
    ).toBe("2m ago");
  });

  it("formats hours for anything under a day", () => {
    expect(
      formatRelativeTime(new Date(Date.now() - 3 * 3_600_000).toISOString()),
    ).toBe("3h ago");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/market/live-market-card.test.ts`
Expected: FAIL — `live-market-card.tsx` doesn't exist yet.

- [ ] **Step 3: Write `market-badge.tsx`**

```tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type MarketBadgeVariant = "NEW" | "LIVE" | "PRICE_UPDATED";

const VARIANT_CLASSES: Record<MarketBadgeVariant, string> = {
  NEW: "bg-primary text-primary-foreground",
  LIVE: "bg-info text-white",
  PRICE_UPDATED: "bg-info text-white",
};

const VARIANT_LABELS: Record<MarketBadgeVariant, string> = {
  NEW: "NEW",
  LIVE: "LIVE",
  PRICE_UPDATED: "PRICE UPDATED",
};

export function MarketBadge({
  variant,
  className,
}: {
  variant: MarketBadgeVariant;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        VARIANT_CLASSES[variant],
        "rounded px-2 font-semibold tracking-wide",
        className,
      )}
    >
      {VARIANT_LABELS[variant]}
    </Badge>
  );
}
```

- [ ] **Step 4: Write `live-market-card.tsx`**

```tsx
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupplierLogoTile } from "@/components/ui/supplier-logo-tile";
import {
  MarketBadge,
  type MarketBadgeVariant,
} from "@/components/market/market-badge";
import type { OfferListItem } from "@/modules/offers/types";

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function formatPrice(offer: OfferListItem): {
  primary: string;
  secondary: string | null;
} {
  if (offer.priceType === "ASK" || offer.price === null) {
    return { primary: "ASK", secondary: "Best price on request" };
  }
  const primary = `${offer.currency} ${offer.price.toLocaleString()}`;
  if (offer.previousPrice !== null && offer.previousPrice > offer.price) {
    return {
      primary,
      secondary: `Was ${offer.previousPrice.toLocaleString()}`,
    };
  }
  if (offer.quantity !== null && offer.quantity >= 100) {
    return { primary, secondary: "Bulk price available" };
  }
  return { primary, secondary: null };
}

export interface LiveMarketCardProps {
  offer: OfferListItem;
  actionLabel?: "View Supplier" | "View Product";
}

export function LiveMarketCard({
  offer,
  actionLabel = "View Supplier",
}: LiveMarketCardProps) {
  const price = formatPrice(offer);
  const isPriceDown =
    offer.previousPrice !== null &&
    offer.price !== null &&
    offer.previousPrice > offer.price;
  const whatsappHref = `https://wa.me/${offer.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <div className="border-border bg-card flex min-w-0 flex-col gap-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        {offer.badge ? (
          <MarketBadge variant={offer.badge as MarketBadgeVariant} />
        ) : (
          <span />
        )}
        <span className="text-muted-foreground shrink-0 text-xs">
          {formatRelativeTime(offer.postedAt)}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <SupplierLogoTile initial={offer.supplierName.charAt(0)} size="md" />
        <div className="min-w-0 flex-1">
          <div className="text-foreground flex flex-wrap items-center gap-1 text-sm font-medium">
            <span className="truncate">{offer.supplierName}</span>
            {offer.supplierVerified && (
              <span
                className="text-primary"
                title="Verified Supplier"
                aria-label="Verified Supplier"
              >
                ✓
              </span>
            )}
          </div>
          <div className="text-muted-foreground text-xs">
            {offer.locationName} · {offer.supplierPositiveScorePercent}%
            Positive
          </div>
          <h3 className="text-foreground mt-1 truncate text-base font-semibold">
            {offer.title}
          </h3>
          <p className="text-muted-foreground truncate text-xs">
            {offer.specLine.join(" · ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="border-border text-muted-foreground rounded border px-2 py-0.5 text-[11px]">
              {offer.categoryName}
            </span>
            <span className="border-border text-muted-foreground rounded border px-2 py-0.5 text-[11px]">
              {offer.brandName}
            </span>
          </div>
        </div>
      </div>

      <div className="border-border flex flex-wrap items-end justify-between gap-4 border-t pt-3">
        <div className="flex gap-6 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Quantity</div>
            <div className="text-foreground font-semibold tabular-nums">
              {offer.quantity ?? "—"}
              {offer.quantity ? " units" : ""}
            </div>
            <div className="text-live text-xs">In Stock</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">
              Price ({offer.currency})
            </div>
            <div
              className={`font-semibold tabular-nums ${isPriceDown ? "text-destructive" : "text-foreground"}`}
            >
              {price.primary}
            </div>
            {price.secondary && (
              <div className="text-muted-foreground text-xs">
                {price.secondary}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/suppliers/${offer.supplierSlug}`} />}
          >
            {actionLabel}
          </Button>
          <Button
            size="sm"
            render={<a href={whatsappHref} target="_blank" rel="noreferrer" />}
          >
            <MessageCircle className="mr-1 size-4" aria-hidden />
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/market/live-market-card.test.ts`
Expected: PASS (6 tests). This directly covers Review Focus item 2 (ASK/null price never rendering as "AED null").

- [ ] **Step 6: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors — confirms `render={<Link .../>}` and `render={<a .../>}` satisfy `Button`'s `@base-ui/react` prop types.

- [ ] **Step 7: Commit**

```bash
git add src/components/market/market-badge.tsx src/components/market/live-market-card.tsx src/components/market/live-market-card.test.ts
git commit -m "feat: add MarketBadge and the shared LiveMarketCard"
```

---

### Task 8: `MarketHero` and `FiltersSidebar`

**Files:**

- Create: `src/components/market/market-hero.tsx`
- Create: `src/components/market/filters-sidebar.tsx`

**Interfaces:**

- Consumes: `Category`/`Brand` (Task 2), `MarketStats`/`OfferFilterCriteria` (Task 3), `StatTile` (Task 5), shadcn `Input`/`Select`/`Checkbox`/`Label`/`Sheet`/`Button` (Task 1).
- Produces: `<MarketHero stats categories searchQuery onSearchQueryChange categoryId onCategoryChange />`; `<FiltersSidebar brands categories locationNames criteria onCriteriaChange />`. Task 10 (homepage) wires both to the same `criteria` state.

- [ ] **Step 1: Write `market-hero.tsx`**

```tsx
"use client";

import { FileText, Package, Search, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatTile } from "@/components/ui/stat-tile";
import type { Category } from "@/modules/categories/types";
import type { MarketStats } from "@/modules/offers/types";

export interface MarketHeroProps {
  stats: MarketStats;
  categories: Category[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  categoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export function MarketHero({
  stats,
  categories,
  searchQuery,
  onSearchQueryChange,
  categoryId,
  onCategoryChange,
}: MarketHeroProps) {
  return (
    <section className="border-border bg-primary/5 border-b">
      <div className="mx-auto max-w-[1440px] px-6 py-10">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Live supplier offers from{" "}
          <span className="text-primary">Bur Dubai</span>
        </p>
        <h1 className="text-foreground mt-2 text-4xl font-bold">
          Dubai IT Wholesale Market
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Real-time offers. Verified suppliers. Better sourcing.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search model, SKU, part number, specification..."
              className="h-11 pl-9"
            />
          </div>
          <Select
            value={categoryId ?? "all"}
            onValueChange={(value) =>
              onCategoryChange(value === "all" ? null : String(value))
            }
          >
            <SelectTrigger className="h-11 sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="lg" className="h-11">
            Search
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            icon={Users}
            value={stats.activeSuppliersToday.toLocaleString()}
            label="Active Suppliers Today"
            trendPercent={stats.activeSuppliersTrendPercent}
          />
          <StatTile
            icon={FileText}
            value={stats.offersPostedToday.toLocaleString()}
            label="Offers Posted Today"
            trendPercent={stats.offersPostedTrendPercent}
          />
          <StatTile
            icon={TrendingUp}
            value={stats.priceUpdatesToday.toLocaleString()}
            label="Price Updates"
            trendPercent={stats.priceUpdatesTrendPercent}
          />
          <StatTile
            icon={Package}
            value={stats.newProductsToday.toLocaleString()}
            label="New Products"
            trendPercent={stats.newProductsTrendPercent}
          />
        </div>
      </div>
    </section>
  );
}
```

Note: the mockup's hero has a cityscape/souq photo background; no such image asset exists in this repo, so this uses a flat brand-tinted background (`bg-primary/5`) instead. Flagging this as a deliberate simplification — add a real photo later if the user supplies one.

- [ ] **Step 2: Write `filters-sidebar.tsx`**

```tsx
"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Brand } from "@/modules/brands/types";
import type { Category } from "@/modules/categories/types";
import type { OfferFilterCriteria } from "@/modules/offers/types";

export interface FiltersSidebarProps {
  brands: Brand[];
  categories: Category[];
  locationNames: string[];
  criteria: OfferFilterCriteria;
  onCriteriaChange: (criteria: OfferFilterCriteria) => void;
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}

function FilterControls({
  brands,
  categories,
  locationNames,
  criteria,
  onCriteriaChange,
}: FiltersSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold">Filters</h2>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground text-xs font-medium"
          onClick={() =>
            onCriteriaChange({
              brandIds: [],
              categoryIds: [],
              locationNames: [],
              inStockOnly: false,
              searchQuery: criteria.searchQuery,
            })
          }
        >
          Clear all
        </button>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
          Brand
        </legend>
        {brands.map((brand) => (
          <Label key={brand.id} className="font-normal">
            <Checkbox
              checked={criteria.brandIds.includes(brand.id)}
              onCheckedChange={() =>
                onCriteriaChange({
                  ...criteria,
                  brandIds: toggleValue(criteria.brandIds, brand.id),
                })
              }
            />
            {brand.name}
          </Label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
          Category
        </legend>
        {categories.map((category) => (
          <Label key={category.id} className="justify-between font-normal">
            <span className="flex items-center gap-2">
              <Checkbox
                checked={criteria.categoryIds.includes(category.id)}
                onCheckedChange={() =>
                  onCriteriaChange({
                    ...criteria,
                    categoryIds: toggleValue(criteria.categoryIds, category.id),
                  })
                }
              />
              {category.name}
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {category.offerCount}
            </span>
          </Label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
          Location
        </legend>
        {locationNames.map((location) => (
          <Label key={location} className="font-normal">
            <Checkbox
              checked={criteria.locationNames.includes(location)}
              onCheckedChange={() =>
                onCriteriaChange({
                  ...criteria,
                  locationNames: toggleValue(criteria.locationNames, location),
                })
              }
            />
            {location}
          </Label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
          Availability
        </legend>
        <Label className="font-normal">
          <Checkbox
            checked={criteria.inStockOnly}
            onCheckedChange={(checked) =>
              onCriteriaChange({ ...criteria, inStockOnly: checked })
            }
          />
          In Stock only
        </Label>
      </fieldset>
    </div>
  );
}

export function FiltersSidebar(props: FiltersSidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">
        <FilterControls {...props} />
      </aside>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-1 size-4" aria-hidden />
                Filters
              </Button>
            }
          />
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">
              <FilterControls {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
```

This is the mobile filter path for Review Focus item 5: the Sheet trigger is always rendered (`lg:hidden` wrapper), so filters stay reachable when the desktop `<aside>` is hidden.

- [ ] **Step 3: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors — confirms `Checkbox`'s `checked`/`onCheckedChange` usage and `SheetTrigger`'s `render` prop match the real generated types.

- [ ] **Step 4: Commit**

```bash
git add src/components/market/market-hero.tsx src/components/market/filters-sidebar.tsx
git commit -m "feat: add MarketHero and FiltersSidebar (with mobile Sheet)"
```

---

### Task 9: `LiveMarketFeed` and `MarketPulseSidebar`

**Files:**

- Create: `src/components/market/live-market-feed.tsx`
- Create: `src/components/market/market-pulse-sidebar.tsx`

**Interfaces:**

- Consumes: `filterOffers`/`sortOffers` (Task 3), `LiveMarketCard` (Task 7), `SidebarWidget`/`SupplierLogoTile` (Task 5), shadcn `Select`/`Tabs`/`Button` (Task 1).
- Produces: `<LiveMarketFeed offers criteria />`; `<MarketPulseSidebar trendingCategories topSuppliers />`. Task 10 wires both into the homepage.

- [ ] **Step 1: Write `live-market-feed.tsx`**

```tsx
"use client";

import { LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LiveMarketCard } from "@/components/market/live-market-card";
import {
  filterOffers,
  sortOffers,
  type SortOption,
} from "@/modules/offers/filter-offers";
import type {
  OfferFilterCriteria,
  OfferListItem,
} from "@/modules/offers/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function LiveMarketFeed({
  offers,
  criteria,
}: {
  offers: OfferListItem[];
  criteria: OfferFilterCriteria;
}) {
  const [sort, setSort] = useState<SortOption>("recent");
  const [view, setView] = useState<"list" | "grid">("list");

  const visibleOffers = useMemo(
    () => sortOffers(filterOffers(offers, criteria), sort),
    [offers, criteria, sort],
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <span className="bg-live size-2 rounded-full" aria-hidden />
          LIVE MARKET
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Sort by:</span>
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as SortOption)}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List className="size-4" aria-hidden />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      {visibleOffers.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-md border border-dashed p-12 text-center text-sm">
          No offers match the selected filters.
        </div>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2"
              : "flex flex-col gap-4"
          }
        >
          {visibleOffers.map((offer) => (
            <LiveMarketCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
```

This is the empty-state handling for Review Focus item 3.

- [ ] **Step 2: Write `market-pulse-sidebar.tsx`**

```tsx
import { Flame } from "lucide-react";
import { SidebarWidget } from "@/components/ui/sidebar-widget";
import { SupplierLogoTile } from "@/components/ui/supplier-logo-tile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/modules/categories/types";
import type { SupplierSummary } from "@/modules/suppliers/types";

// placeholder — no backing schema field yet (price-trend intelligence is deferred, per project_plan.md)
const MOCK_PRICE_MOVEMENTS = [
  { categoryId: "cat-laptops", categoryName: "Laptops", changePercent: 24 },
  { categoryId: "cat-storage", categoryName: "Storage", changePercent: 18 },
  {
    categoryId: "cat-networking",
    categoryName: "Networking",
    changePercent: 32,
  },
  { categoryId: "cat-desktops", categoryName: "Desktops", changePercent: 12 },
  { categoryId: "cat-monitors", categoryName: "Monitors", changePercent: 9 },
];

// placeholder — no backing schema field yet (trending-search tracking is deferred)
const MOCK_TRENDING_SEARCHES = [
  { term: "iPhone 15", searchCount: 248 },
  { term: "RTX 4090", searchCount: 197 },
  { term: "Lenovo ThinkPad", searchCount: 186 },
  { term: "HP 250 G10", searchCount: 162 },
  { term: "WD 8TB", searchCount: 148 },
];

// placeholder — no backing schema field yet (WTB is a deferred feature)
const MOCK_WTB_REQUESTS = [
  {
    id: "wtb-1",
    title: "WTB iPhone 15 Pro Max 256GB",
    location: "Dubai",
    postedLabel: "5m ago",
  },
  {
    id: "wtb-2",
    title: "WTB RTX 4080 / 4090",
    location: "Urgent",
    postedLabel: "12m ago",
  },
  {
    id: "wtb-3",
    title: "WTB Cisco Switches",
    location: "Dubai",
    postedLabel: "28m ago",
  },
  {
    id: "wtb-4",
    title: "WTB Dell Laptops (i7)",
    location: "Corporate",
    postedLabel: "41m ago",
  },
];

export function MarketPulseSidebar({
  trendingCategories,
  topSuppliers,
}: {
  trendingCategories: Category[];
  topSuppliers: SupplierSummary[];
}) {
  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4">
      <SidebarWidget title="Market Pulse" liveIndicator>
        <Tabs defaultValue="categories">
          <TabsList className="mb-2 w-full">
            <TabsTrigger value="categories" className="flex-1">
              Trending Categories
            </TabsTrigger>
            <TabsTrigger value="prices" className="flex-1">
              Price Movement
            </TabsTrigger>
          </TabsList>
          <TabsContent value="categories" className="flex flex-col gap-2">
            {trendingCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">{category.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {category.offerCount}
                </span>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="prices" className="flex flex-col gap-2">
            {MOCK_PRICE_MOVEMENTS.map((movement) => (
              <div
                key={movement.categoryId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">{movement.categoryName}</span>
                <span
                  className={`tabular-nums ${movement.changePercent >= 0 ? "text-live" : "text-destructive"}`}
                >
                  {movement.changePercent >= 0 ? "+" : ""}
                  {movement.changePercent}%
                </span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </SidebarWidget>

      <SidebarWidget title="Trending Today" showViewAll>
        {MOCK_TRENDING_SEARCHES.map((entry, index) => (
          <div
            key={entry.term}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-foreground">
              <span className="text-muted-foreground mr-2">{index + 1}</span>
              {entry.term}
            </span>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Flame className="text-destructive size-3" aria-hidden />
              {entry.searchCount} searches
            </span>
          </div>
        ))}
      </SidebarWidget>

      <SidebarWidget title="Top Active Suppliers" showViewAll>
        {topSuppliers.map((supplier) => (
          <div key={supplier.id} className="flex items-center gap-2 text-sm">
            <SupplierLogoTile
              initial={supplier.companyName.charAt(0)}
              size="sm"
            />
            <div className="min-w-0">
              <div className="text-foreground truncate font-medium">
                {supplier.companyName}
              </div>
              <div className="text-muted-foreground text-xs">
                {supplier.activeOfferCount} offers ·{" "}
                {supplier.positiveScorePercent}% positive
              </div>
            </div>
          </div>
        ))}
      </SidebarWidget>

      <SidebarWidget title="Latest WTB Requests" showViewAll>
        {MOCK_WTB_REQUESTS.map((request) => (
          <div key={request.id} className="text-sm">
            <div className="text-foreground">{request.title}</div>
            <div className="text-muted-foreground text-xs">
              {request.location} · {request.postedLabel}
            </div>
          </div>
        ))}
      </SidebarWidget>
    </aside>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/market/live-market-feed.tsx src/components/market/market-pulse-sidebar.tsx
git commit -m "feat: add LiveMarketFeed and MarketPulseSidebar"
```

---

### Task 10: Homepage assembly

**Files:**

- Modify: `src/app/page.tsx` (full replacement)

**Interfaces:**

- Consumes: every component/module from Tasks 2–9.

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { MarketHero } from "@/components/market/market-hero";
import { FiltersSidebar } from "@/components/market/filters-sidebar";
import { LiveMarketFeed } from "@/components/market/live-market-feed";
import { MarketPulseSidebar } from "@/components/market/market-pulse-sidebar";
import { getMockBrands } from "@/modules/brands/mock-data";
import { getMockCategories } from "@/modules/categories/mock-data";
import { EMPTY_OFFER_FILTERS } from "@/modules/offers/filter-offers";
import { getMockMarketStats, getMockOffers } from "@/modules/offers/mock-data";
import { getMockSuppliers } from "@/modules/suppliers/mock-data";
import type { OfferFilterCriteria } from "@/modules/offers/types";

const LOCATION_NAMES = ["Bur Dubai", "Deira", "Al Fahidi", "Al Rigga"];

export default function HomePage() {
  const [criteria, setCriteria] =
    useState<OfferFilterCriteria>(EMPTY_OFFER_FILTERS);

  const brands = getMockBrands();
  const categories = getMockCategories();
  const offers = getMockOffers();
  const stats = getMockMarketStats();
  const topSuppliers = [...getMockSuppliers()]
    .sort((a, b) => b.activeOfferCount - a.activeOfferCount)
    .slice(0, 4);

  return (
    <>
      <MarketHero
        stats={stats}
        categories={categories}
        categoryId={criteria.categoryIds[0] ?? null}
        onCategoryChange={(categoryId) =>
          setCriteria((prev) => ({
            ...prev,
            categoryIds: categoryId ? [categoryId] : [],
          }))
        }
        searchQuery={criteria.searchQuery}
        onSearchQueryChange={(searchQuery) =>
          setCriteria((prev) => ({ ...prev, searchQuery }))
        }
      />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-6 lg:flex-row">
        <FiltersSidebar
          brands={brands}
          categories={categories}
          locationNames={LOCATION_NAMES}
          criteria={criteria}
          onCriteriaChange={setCriteria}
        />
        <LiveMarketFeed offers={offers} criteria={criteria} />
        <MarketPulseSidebar
          trendingCategories={categories}
          topSuppliers={topSuppliers}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual smoke check**

Run: `pnpm dev`, open `http://localhost:3000/`.
Expected: hero, stat tiles, filters sidebar, six live-market cards, and the Market Pulse sidebar all render; checking a brand/category checkbox narrows the card list live; typing in the search box filters by title/brand/spec.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: assemble the Live Market homepage"
```

---

### Task 11: `SupplierHeader`, `SupplierStatRow`, `SupplierContactPanel`

**Files:**

- Create: `src/components/suppliers/supplier-header.tsx`
- Create: `src/components/suppliers/supplier-stat-row.tsx`
- Create: `src/components/suppliers/supplier-contact-panel.tsx`

**Interfaces:**

- Consumes: `SupplierProfile` (Task 4), `SupplierLogoTile`/`StatTile` (Task 5), shadcn `Button` (Task 1).
- Produces: `<SupplierHeader supplier />`, `<SupplierStatRow supplier />`, `<SupplierContactPanel supplier />`. Task 13's page renders all three.

- [ ] **Step 1: Write `supplier-header.tsx`**

```tsx
import Link from "next/link";
import { BadgeCheck, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupplierLogoTile } from "@/components/ui/supplier-logo-tile";
import type { SupplierProfile } from "@/modules/suppliers/types";

export function SupplierHeader({ supplier }: { supplier: SupplierProfile }) {
  const whatsappHref = `https://wa.me/${supplier.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <div className="border-border bg-card border-b">
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        <nav className="text-muted-foreground mb-4 text-sm">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{supplier.companyName}</span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            <SupplierLogoTile initial={supplier.logoInitial} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-foreground text-2xl font-bold break-words">
                  {supplier.companyName}
                </h1>
                {supplier.verified && (
                  <BadgeCheck
                    className="text-primary size-5 shrink-0"
                    aria-label="Verified Supplier"
                  />
                )}
              </div>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden />
                  {supplier.locationName}
                </span>
                <span>·</span>
                <span>{supplier.positiveScorePercent}% Positive</span>
                <span>·</span>
                <span>Active since {supplier.memberSinceYear}</span>
                <span>·</span>
                <span className="text-primary">Verified Supplier</span>
              </div>
              {supplier.description && (
                <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
                  {supplier.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {supplier.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-border text-muted-foreground rounded border px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              render={
                <a href={whatsappHref} target="_blank" rel="noreferrer" />
              }
            >
              WhatsApp
            </Button>
            {supplier.phone && (
              <Button
                variant="outline"
                render={<a href={`tel:${supplier.phone}`} />}
              >
                <Phone className="mr-1 size-4" aria-hidden />
                Call
              </Button>
            )}
            {supplier.email && (
              <Button
                variant="outline"
                render={<a href={`mailto:${supplier.email}`} />}
              >
                <Mail className="mr-1 size-4" aria-hidden />
                Email
              </Button>
            )}
            {supplier.googleMapsUrl && (
              <Button
                variant="outline"
                render={
                  <a
                    href={supplier.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <MapPin className="mr-1 size-4" aria-hidden />
                Visit Location
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Note: the mockup's cover photo is skipped (no image asset available) — same simplification as Task 8's hero. `break-words` on the company name and `min-w-0` on the flex containers handle Review Focus item 4 (long names not breaking the layout).

- [ ] **Step 2: Write `supplier-stat-row.tsx`**

```tsx
import { Calendar, Clock, Layers, ThumbsUp, Users, Zap } from "lucide-react";
import { StatTile } from "@/components/ui/stat-tile";
import type { SupplierProfile } from "@/modules/suppliers/types";

function formatRelativeTime(iso: string): string {
  const hours = Math.max(
    1,
    Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000),
  );
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export function SupplierStatRow({ supplier }: { supplier: SupplierProfile }) {
  const yearsActive = new Date().getFullYear() - supplier.memberSinceYear;

  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-3 px-6 py-4 sm:grid-cols-3 lg:grid-cols-6">
      <StatTile
        icon={Users}
        value={String(supplier.activeOfferCount)}
        label="Active Offers"
      />
      <StatTile
        icon={Clock}
        value={formatRelativeTime(supplier.lastBroadcastAt)}
        label="Last Broadcast"
      />
      <StatTile
        icon={ThumbsUp}
        value={`${supplier.positiveScorePercent}%`}
        label="Positive Score"
      />
      <StatTile
        icon={Layers}
        value={String(supplier.categoryMix.length)}
        label="Product Categories"
      />
      <StatTile
        icon={Zap}
        value={supplier.avgResponseTimeLabel}
        label="Avg Response Speed"
      />
      <StatTile
        icon={Calendar}
        value={`${yearsActive}+ years`}
        label="Active on SouqFeed"
      />
    </div>
  );
}
```

- [ ] **Step 3: Write `supplier-contact-panel.tsx`**

```tsx
import { Mail, MapPin, Phone } from "lucide-react";
import type { SupplierProfile } from "@/modules/suppliers/types";

export function SupplierContactPanel({
  supplier,
}: {
  supplier: SupplierProfile;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="border-border bg-card rounded-md border p-4">
        <h3 className="text-foreground mb-3 text-sm font-semibold">
          Contact Information
        </h3>
        <div className="text-muted-foreground flex flex-col gap-2 text-sm">
          {supplier.phone && (
            <span className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden />
              {supplier.phone}
            </span>
          )}
          {supplier.email && (
            <span className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden />
              {supplier.email}
            </span>
          )}
          {supplier.address && (
            <span className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {supplier.address}
            </span>
          )}
          {supplier.googleMapsUrl && (
            <a
              href={supplier.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              View on Google Maps
            </a>
          )}
        </div>
      </div>

      <div className="border-border bg-card rounded-md border p-4">
        <h3 className="text-foreground mb-3 text-sm font-semibold">
          Business Hours
        </h3>
        <div className="flex flex-col gap-2 text-sm">
          {supplier.businessHours.map((entry) => (
            <div
              key={entry.day}
              className="text-muted-foreground flex items-center justify-between"
            >
              <span>{entry.day}</span>
              <span className="text-foreground">{entry.hours}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/suppliers/supplier-header.tsx src/components/suppliers/supplier-stat-row.tsx src/components/suppliers/supplier-contact-panel.tsx
git commit -m "feat: add SupplierHeader, SupplierStatRow, and SupplierContactPanel"
```

---

### Task 12: `CategoryMixDonut`, `BroadcastActivityBars`, `SupplierInsightsSidebar`

**Files:**

- Create: `src/components/suppliers/category-mix-donut.tsx`
- Create: `src/components/suppliers/broadcast-activity-bars.tsx`
- Create: `src/components/suppliers/supplier-insights-sidebar.tsx`

**Interfaces:**

- Consumes: `CategoryMixSlice`/`BroadcastActivityDay`/`SupplierProfile` (Task 4), `SidebarWidget` (Task 5).
- Produces: `<CategoryMixDonut slices totalLabel />`, `<BroadcastActivityBars days />`, `<SupplierInsightsSidebar supplier />`. Task 13's page renders the sidebar.

- [ ] **Step 1: Write `category-mix-donut.tsx`** (hand-rolled SVG, no charting library — per spec)

```tsx
import type { CategoryMixSlice } from "@/modules/suppliers/types";

const COLORS = [
  "#0F6B45",
  "#2A5C8A",
  "#16A34A",
  "#6B7280",
  "#9CA3AF",
  "#DC2626",
];
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CategoryMixDonut({
  slices,
  totalLabel,
}: {
  slices: CategoryMixSlice[];
  totalLabel: string;
}) {
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 100 100" className="size-28 shrink-0 -rotate-90">
        {slices.map((slice, index) => {
          const length = (slice.sharePercent / 100) * CIRCUMFERENCE;
          const dashArray = `${length} ${CIRCUMFERENCE - length}`;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle
              key={slice.categoryId}
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={COLORS[index % COLORS.length]}
              strokeWidth="14"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </svg>
      <div className="flex min-w-0 flex-col gap-1 text-xs">
        <span className="text-foreground text-sm font-semibold">
          {totalLabel}
        </span>
        {slices.map((slice, index) => (
          <div key={slice.categoryId} className="flex items-center gap-1.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
              aria-hidden
            />
            <span className="text-muted-foreground truncate">
              {slice.categoryName}
            </span>
            <span className="text-foreground tabular-nums">
              {slice.sharePercent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `broadcast-activity-bars.tsx`**

```tsx
import type { BroadcastActivityDay } from "@/modules/suppliers/types";

export function BroadcastActivityBars({
  days,
}: {
  days: BroadcastActivityDay[];
}) {
  const max = Math.max(...days.map((day) => day.count), 1);

  return (
    <div className="flex h-24 items-end gap-2">
      {days.map((day) => (
        <div
          key={day.label}
          className="flex flex-1 flex-col items-center gap-1"
        >
          <div
            className="bg-primary/70 w-full rounded-sm"
            style={{ height: `${Math.max(4, (day.count / max) * 72)}px` }}
            aria-hidden
          />
          <span className="text-muted-foreground text-[10px]">{day.label}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write `supplier-insights-sidebar.tsx`**

```tsx
import { BadgeCheck, Calendar, ThumbsUp, Zap } from "lucide-react";
import { SidebarWidget } from "@/components/ui/sidebar-widget";
import { CategoryMixDonut } from "@/components/suppliers/category-mix-donut";
import { BroadcastActivityBars } from "@/components/suppliers/broadcast-activity-bars";
import type { SupplierProfile } from "@/modules/suppliers/types";

export function SupplierInsightsSidebar({
  supplier,
}: {
  supplier: SupplierProfile;
}) {
  const yearsActive = new Date().getFullYear() - supplier.memberSinceYear;

  return (
    <div className="flex flex-col gap-4">
      <SidebarWidget title="Top Brands Supplied" showViewAll>
        {supplier.topBrands.map((brand) => (
          <div
            key={brand.brandId}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-foreground">{brand.brandName}</span>
            <span className="text-muted-foreground tabular-nums">
              {brand.sharePercent}%
            </span>
          </div>
        ))}
      </SidebarWidget>

      <SidebarWidget title="Category Mix">
        <CategoryMixDonut
          slices={supplier.categoryMix}
          totalLabel={`${supplier.activeOfferCount} Active Offers`}
        />
      </SidebarWidget>

      <SidebarWidget title="Broadcast Activity (Last 7 Days)">
        <BroadcastActivityBars days={supplier.broadcastActivity} />
      </SidebarWidget>

      <SidebarWidget title="Market Trust Signals">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-start gap-2">
            <BadgeCheck className="text-primary size-4 shrink-0" aria-hidden />
            <div>
              <div className="text-foreground font-medium">
                Verified Supplier
              </div>
              <div className="text-muted-foreground text-xs">
                Identity, business & location verified
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ThumbsUp className="text-primary size-4 shrink-0" aria-hidden />
            <div>
              <div className="text-foreground font-medium">
                {supplier.positiveScorePercent}% Positive Score
              </div>
              <div className="text-muted-foreground text-xs">
                Based on buyer feedback
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Zap className="text-primary size-4 shrink-0" aria-hidden />
            <div>
              <div className="text-foreground font-medium">
                {supplier.avgResponseTimeLabel} Response Speed
              </div>
              <div className="text-muted-foreground text-xs">
                Average time to respond to inquiries
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="text-primary size-4 shrink-0" aria-hidden />
            <div>
              <div className="text-foreground font-medium">
                {yearsActive}+ years on SouqFeed
              </div>
              <div className="text-muted-foreground text-xs">
                Active since {supplier.memberSinceYear}
              </div>
            </div>
          </div>
        </div>
      </SidebarWidget>
    </div>
  );
}
```

- [ ] **Step 4: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/suppliers/category-mix-donut.tsx src/components/suppliers/broadcast-activity-bars.tsx src/components/suppliers/supplier-insights-sidebar.tsx
git commit -m "feat: add CategoryMixDonut, BroadcastActivityBars, and SupplierInsightsSidebar"
```

---

### Task 13: `SupplierTabs`, `SupplierOffersSection`, and the supplier profile page

Addition beyond the spec's illustrative file list: `supplier-offers-section.tsx`
wasn't individually named in the spec's component inventory, but the spec's
Screen Breakdown section calls for "offers list+filters" as the primary
column under the supplier profile's tabs — this task adds that as its own
small component (search input + filtered/sorted `LiveMarketCard` list)
rather than inlining it into the page, keeping the page thin per the
project's screen-implementation workflow.

**Files:**

- Create: `src/components/suppliers/supplier-tabs.tsx`
- Create: `src/components/suppliers/supplier-offers-section.tsx`
- Create: `src/app/suppliers/[slug]/page.tsx`

**Interfaces:**

- Consumes: everything from Tasks 4, 7, and 11–12.

- [ ] **Step 1: Write `supplier-tabs.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SupplierTabs({
  liveOffersContent,
}: {
  liveOffersContent: ReactNode;
}) {
  return (
    <Tabs defaultValue="live-offers">
      <TabsList>
        <TabsTrigger value="live-offers">Live Offers</TabsTrigger>
        <TabsTrigger value="history">Broadcast History</TabsTrigger>
        <TabsTrigger value="about">About Supplier</TabsTrigger>
        <TabsTrigger value="brands">Brands & Categories</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="live-offers">{liveOffersContent}</TabsContent>
      <TabsContent value="history">
        <p className="text-muted-foreground py-8 text-center text-sm">
          Broadcast history is not available yet.
        </p>
      </TabsContent>
      <TabsContent value="about">
        <p className="text-muted-foreground py-8 text-center text-sm">
          Supplier details are shown in the header above.
        </p>
      </TabsContent>
      <TabsContent value="brands">
        <p className="text-muted-foreground py-8 text-center text-sm">
          Brand and category management is not available yet.
        </p>
      </TabsContent>
      <TabsContent value="contact">
        <p className="text-muted-foreground py-8 text-center text-sm">
          See Contact Information in the sidebar.
        </p>
      </TabsContent>
    </Tabs>
  );
}
```

Only "Live Offers" has real content in this phase — the other four tabs are present (matching the mockup's tab bar) but show a one-line placeholder message instead of full content, since Broadcast History (Phase 4+) and a full About/Brands editor aren't built yet. This is a deliberate scope cut, not a missing feature.

- [ ] **Step 2: Write `supplier-offers-section.tsx`**

```tsx
"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { LiveMarketCard } from "@/components/market/live-market-card";
import {
  EMPTY_OFFER_FILTERS,
  filterOffers,
  sortOffers,
} from "@/modules/offers/filter-offers";
import type { OfferListItem } from "@/modules/offers/types";

export function SupplierOffersSection({
  supplierName,
  offers,
}: {
  supplierName: string;
  offers: OfferListItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const visibleOffers = useMemo(
    () =>
      sortOffers(
        filterOffers(offers, { ...EMPTY_OFFER_FILTERS, searchQuery }),
        "recent",
      ),
    [offers, searchQuery],
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={`Search in ${supplierName}'s stock...`}
          className="h-10 pl-9"
        />
      </div>

      <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
        <span className="bg-live size-2 rounded-full" aria-hidden />
        Live Offers from {supplierName}
      </h2>

      {visibleOffers.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-md border border-dashed p-12 text-center text-sm">
          No offers match your search.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleOffers.map((offer) => (
            <LiveMarketCard
              key={offer.id}
              offer={offer}
              actionLabel="View Product"
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write the supplier profile page**

`src/app/suppliers/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { SupplierHeader } from "@/components/suppliers/supplier-header";
import { SupplierStatRow } from "@/components/suppliers/supplier-stat-row";
import { SupplierTabs } from "@/components/suppliers/supplier-tabs";
import { SupplierInsightsSidebar } from "@/components/suppliers/supplier-insights-sidebar";
import { SupplierContactPanel } from "@/components/suppliers/supplier-contact-panel";
import { SupplierOffersSection } from "@/components/suppliers/supplier-offers-section";
import { getMockSupplierBySlug } from "@/modules/suppliers/mock-data";
import { getMockOffers } from "@/modules/offers/mock-data";

export default async function SupplierProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supplier = getMockSupplierBySlug(slug);

  if (!supplier) {
    notFound();
  }

  const offers = getMockOffers().filter((offer) => offer.supplierSlug === slug);

  return (
    <>
      <SupplierHeader supplier={supplier} />
      <SupplierStatRow supplier={supplier} />
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-10">
        <SupplierTabs
          liveOffersContent={
            <div className="flex flex-col gap-6 pt-4 lg:flex-row">
              <SupplierOffersSection
                supplierName={supplier.companyName}
                offers={offers}
              />
              <div className="w-full shrink-0 lg:w-80">
                <SupplierInsightsSidebar supplier={supplier} />
                <div className="mt-4">
                  <SupplierContactPanel supplier={supplier} />
                </div>
              </div>
            </div>
          }
        />
      </div>
    </>
  );
}
```

`notFound()` here is Review Focus item 1: an unknown slug renders Next.js's built-in 404 page instead of crashing or rendering blank.

- [ ] **Step 4: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual smoke check**

Run: `pnpm dev`.

- Open `http://localhost:3000/suppliers/al-hadi-computers` — expect the full header, stat row, tabs, offers list (one card: Lenovo ThinkPad E14 Gen 7), and the insights/contact sidebar.
- Open `http://localhost:3000/suppliers/does-not-exist` — expect Next.js's 404 page, not a crash or blank page (Review Focus item 1).
- From the homepage, click "View Supplier" on any card — expect navigation to that supplier's real profile page.

- [ ] **Step 6: Commit**

```bash
git add src/components/suppliers/supplier-tabs.tsx src/components/suppliers/supplier-offers-section.tsx "src/app/suppliers/[slug]/page.tsx"
git commit -m "feat: assemble the supplier profile page"
```

---

### Task 14: Whole-phase verification

**Files:**

- Modify: `current.md` (mark Phase 0.5 complete)

No new product code — this task is the full verification pass plus the doc update that closes out the phase.

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: all tests pass (Tasks 2, 3, 4, and 7's Vitest suites).

- [ ] **Step 2: Lint and format check**

Run: `pnpm lint && pnpm format:check`
Expected: no errors. Fix any reported issues (e.g. run `pnpm format` if formatting drifted) before proceeding.

- [ ] **Step 3: Production build**

Run: `pnpm build`
Expected: builds successfully with no type errors.

- [ ] **Step 4: Manual browser pass against both mockups**

Run: `pnpm dev`. With `ui-design-ideas/livefeed-home-ui.png` and `ui-design-ideas/supplier-details-view.png` open side-by-side:

- Desktop width (~1440px): compare the homepage and `/suppliers/al-hadi-computers` against the two mockups — hero, stat tiles, badges (NEW green / LIVE and PRICE UPDATED dark blue-grey), live-market cards, filters sidebar, Market Pulse sidebar, supplier header/stat row/tabs/insights sidebar should all be present and visually close.
- Mobile width (~375px, browser dev tools): confirm the filters "Filters" button opens the Sheet and checkboxes still work inside it; confirm cards stack in a single column; confirm the supplier page's sidebar content moves below the offers list; confirm nothing overflows horizontally.
- Deliberately trigger the empty state: filter by search query `nonexistent` on both the homepage and a supplier page and confirm an explicit empty-state message renders (not a blank area) — then clear it.
- Deliberately trigger a long-content overflow: in `src/modules/suppliers/mock-data.ts`, temporarily change `AL_HADI.companyName` to something like `"Al Hadi Computers and General Trading Wholesale Distribution LLC"` and reload `/suppliers/al-hadi-computers` at both desktop and mobile width — confirm the name wraps (`break-words`) instead of overflowing the header or pushing the verified badge off-screen, then revert the change (do not commit it).

- [ ] **Step 5: Update `current.md`**

Move the Phase 0.5 items from "Next" into "Completed", and update "Next" to point at Phase 1:

```markdown
## Completed

... (existing bullets unchanged) ...

- **Phase 0.5 (UI foundation) complete** — Live Market homepage and Supplier
  profile page built against static mock data, matching
  `ui-design-ideas/`'s visual language, per
  `docs/superpowers/specs/2026-09-30-souqfeed-ui-foundation-design.md`.
  Theme tokens applied to `globals.css`; shared components
  (`LiveMarketCard`, `StatTile`, `SupplierLogoTile`, `SidebarWidget`,
  `SiteHeader`) built once and reused across both screens; mock data
  lives in `src/modules/{suppliers,offers,brands,categories}/` behind
  the same accessor shapes their real `queries.ts` counterparts will
  eventually have.

## Next

- Phase 1: full Drizzle schema for every core table in
  `docs/data-model.md`, Better Auth wiring with `ADMIN`/`SUPPLIER` role
  guards, a seed script creating one admin user, and a minimal/unstyled
  login page proving the auth flow end-to-end — plan already written at
  `docs/superpowers/plans/2026-09-30-phase1-database-auth.md`.
```

- [ ] **Step 6: Commit**

```bash
git add current.md
git commit -m "docs: mark Phase 0.5 (UI foundation) complete"
```
