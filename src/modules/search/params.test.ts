import { describe, expect, it } from "vitest";
import { parseSearchParams, queryForms, searchUrl } from "./params";

const BRAND = "0b9d5e3a-1c2f-4a6b-8d7e-9f0a1b2c3d4e";

describe("parseSearchParams", () => {
  it("reads every filter", () => {
    expect(
      parseSearchParams({
        q: "  Lenovo E14 ",
        brand: BRAND,
        supplier: "buraqa-star",
        location: "Bur Dubai",
        price: "ask",
        availability: "available",
        fresh: "24h",
        page: "3",
      }),
    ).toEqual({
      query: "Lenovo E14",
      brandId: BRAND,
      categoryId: null,
      supplierSlug: "buraqa-star",
      location: "Bur Dubai",
      price: "ask",
      availableOnly: true,
      fresh: "24h",
      page: 3,
    });
  });

  it("ignores malformed values instead of guessing", () => {
    expect(
      parseSearchParams({
        brand: "not-a-uuid",
        supplier: "Robert'); DROP",
        price: "free",
        fresh: "1y",
        page: "-2",
      }),
    ).toMatchObject({
      brandId: null,
      supplierSlug: null,
      price: null,
      fresh: null,
      page: 1,
    });
  });
});

describe("searchUrl", () => {
  it("round-trips filters and leaves defaults out", () => {
    const filters = parseSearchParams({ q: "wd purple", price: "fixed" });
    expect(searchUrl(filters)).toBe("/search?q=wd+purple&price=fixed");
    expect(searchUrl(filters, 2)).toBe(
      "/search?q=wd+purple&price=fixed&page=2",
    );
    expect(searchUrl(parseSearchParams({}))).toBe("/search");
  });
});

describe("queryForms", () => {
  it("builds a safe prefix query", () => {
    expect(queryForms("E14 U7 16/512")).toEqual({
      normalized: "e14 u7 16 512",
      partNumber: "E14U716/512",
      tsQuery: "e14:* & u7:* & 16:* & 512:*",
    });
  });

  it("strips tsquery syntax from what the user typed", () => {
    expect(queryForms("laptop & !(x) | 'y'").tsQuery).toBe(
      "laptop:* & x:* & y:*",
    );
    expect(queryForms("  ").tsQuery).toBeNull();
  });
});
