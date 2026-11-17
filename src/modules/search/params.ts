import {
  normalizePartNumber,
  normalizeTitle,
} from "@/modules/products/normalize";

export const FRESHNESS_WINDOWS = {
  "1h": 1,
  "24h": 24,
  "3d": 72,
  "7d": 168,
} as const;

export type FreshnessWindow = keyof typeof FRESHNESS_WINDOWS;

export interface SearchFilters {
  query: string;
  brandId: string | null;
  categoryId: string | null;
  supplierSlug: string | null;
  location: string | null;
  price: "fixed" | "ask" | null;
  availableOnly: boolean;
  fresh: FreshnessWindow | null;
  page: number;
}

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reads search filters from the URL, ignoring anything malformed. */
export function parseSearchParams(params: Params): SearchFilters {
  const page = Number(first(params.page));
  const price = first(params.price);
  const fresh = first(params.fresh);
  const brand = first(params.brand);
  const category = first(params.category);
  const supplier = first(params.supplier);
  return {
    query: first(params.q).slice(0, 120),
    brandId: UUID.test(brand) ? brand : null,
    categoryId: UUID.test(category) ? category : null,
    supplierSlug: /^[a-z0-9-]{1,120}$/.test(supplier) ? supplier : null,
    location: first(params.location).slice(0, 80) || null,
    price: price === "fixed" || price === "ask" ? price : null,
    availableOnly: first(params.availability) === "available",
    fresh: fresh in FRESHNESS_WINDOWS ? (fresh as FreshnessWindow) : null,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** The URL for a set of filters; defaults are left out. */
export function searchUrl(filters: SearchFilters, page = 1): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.brandId) params.set("brand", filters.brandId);
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.supplierSlug) params.set("supplier", filters.supplierSlug);
  if (filters.location) params.set("location", filters.location);
  if (filters.price) params.set("price", filters.price);
  if (filters.availableOnly) params.set("availability", "available");
  if (filters.fresh) params.set("fresh", filters.fresh);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

export interface QueryForms {
  /** Lower-case words, as matched against model, alias, and title. */
  normalized: string;
  partNumber: string;
  /** Prefix tsquery, e.g. "lenovo:* & e14:*", or null for an empty query. */
  tsQuery: string | null;
}

/**
 * The query in the forms each ranking tier compares against. Words are cut to
 * letters and digits, so nothing user-typed reaches tsquery syntax.
 */
export function queryForms(query: string): QueryForms {
  const normalized = normalizeTitle(query);
  const words = normalized.split(" ").filter(Boolean).slice(0, 8);
  return {
    normalized,
    partNumber: normalizePartNumber(query),
    tsQuery: words.length ? words.map((word) => `${word}:*`).join(" & ") : null,
  };
}
