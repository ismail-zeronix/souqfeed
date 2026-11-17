import { isUuid } from "@/lib/validation/form";

export const PRODUCT_PAGE_SIZE = 50;

export interface ProductFilters {
  query: string;
  brandId: string | null;
  categoryId: string | null;
  page: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

/** URL input is untrusted, so anything invalid just means "no filter". */
export function parseProductFilters(params: SearchParams): ProductFilters {
  const brandId = single(params.brand);
  const categoryId = single(params.category);
  const page = Number.parseInt(single(params.page), 10);
  return {
    query: single(params.q).trim().slice(0, 120),
    brandId: isUuid(brandId) ? brandId : null,
    categoryId: isUuid(categoryId) ? categoryId : null,
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

/** Makes %, _ and \ literal, so searching "50%" doesn't match everything. */
export function toContainsPattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}

export function toProductListUrl(
  filters: ProductFilters,
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.brandId) params.set("brand", filters.brandId);
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/admin/products?${search}` : "/admin/products";
}
