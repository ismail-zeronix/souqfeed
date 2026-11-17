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
    expect(await resolveUniqueSlug("!!!", async () => false)).toBe("supplier");
    expect(await resolveUniqueSlug("!!!", async () => false, "category")).toBe(
      "category",
    );
  });
});
