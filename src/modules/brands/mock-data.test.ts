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
