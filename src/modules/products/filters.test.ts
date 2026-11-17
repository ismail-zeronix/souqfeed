import { describe, expect, it } from "vitest";
import {
  parseProductFilters,
  toContainsPattern,
  toProductListUrl,
} from "./filters";

const ID = "7f3c1b52-5f0e-4a51-9a3b-3f2f8f6b1c11";

describe("parseProductFilters", () => {
  it("reads valid values", () => {
    expect(
      parseProductFilters({ q: " thinkpad ", brand: ID, page: "3" }),
    ).toEqual({ query: "thinkpad", brandId: ID, categoryId: null, page: 3 });
  });

  it("treats invalid values as no filter", () => {
    expect(
      parseProductFilters({ brand: "x'; drop", category: ["a"], page: "-2" }),
    ).toEqual({ query: "", brandId: null, categoryId: null, page: 1 });
    expect(parseProductFilters({ page: "abc" }).page).toBe(1);
    expect(parseProductFilters({ page: "99999999999999999999" }).page).toBe(1);
  });
});

describe("toContainsPattern", () => {
  it("escapes LIKE wildcards", () => {
    expect(toContainsPattern("50%_a\\b")).toBe("%50\\%\\_a\\\\b%");
  });
});

describe("toProductListUrl", () => {
  it("keeps filters and only includes the page after the first", () => {
    const filters = {
      query: "dell xps",
      brandId: ID,
      categoryId: null,
      page: 1,
    };
    expect(toProductListUrl(filters, 2)).toBe(
      `/admin/products?q=dell+xps&brand=${ID}&page=2`,
    );
    expect(toProductListUrl({ ...filters, query: "", brandId: null }, 1)).toBe(
      "/admin/products",
    );
  });
});
