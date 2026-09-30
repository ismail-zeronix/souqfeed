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
