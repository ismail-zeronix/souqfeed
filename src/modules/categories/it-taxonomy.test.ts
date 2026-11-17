import { describe, expect, it } from "vitest";
import { IT_BRANDS } from "@/modules/brands/it-brands";
import { getMockBrands } from "@/modules/brands/mock-data";
import { IT_TAXONOMY, TOP_LEVEL_SLUGS } from "./it-taxonomy";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("IT_TAXONOMY", () => {
  const all = IT_TAXONOMY.flatMap((top) => [top, ...top.children]);

  it("has globally unique, well-formed slugs", () => {
    const slugs = all.map((category) => category.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(SLUG);
  });

  it("has unique names within each level", () => {
    const topNames = IT_TAXONOMY.map((top) => top.name.toLowerCase());
    expect(new Set(topNames).size).toBe(topNames.length);
    for (const top of IT_TAXONOMY) {
      const names = top.children.map((child) => child.name.toLowerCase());
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it("keeps the categories production already has", () => {
    for (const slug of ["laptops", "storage", "power-ups", "security"]) {
      expect(TOP_LEVEL_SLUGS).toContain(slug);
    }
  });
});

describe("IT_BRANDS", () => {
  it("has unique names and slugs", () => {
    const names = IT_BRANDS.map((brand) => brand.name.toLowerCase());
    const slugs = IT_BRANDS.map((brand) => brand.slug);
    expect(new Set(names).size).toBe(names.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(SLUG);
  });

  it("only hints at real top-level categories", () => {
    for (const brand of IT_BRANDS) {
      expect(brand.categories.length).toBeGreaterThan(0);
      for (const slug of brand.categories)
        expect(TOP_LEVEL_SLUGS).toContain(slug);
    }
  });

  it("agrees with the brands already seeded", () => {
    for (const seeded of getMockBrands()) {
      expect(IT_BRANDS).toContainEqual(
        expect.objectContaining({ name: seeded.name, slug: seeded.slug }),
      );
    }
  });
});
