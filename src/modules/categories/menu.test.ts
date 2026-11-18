import { describe, expect, it } from "vitest";
import { buildCategoryMenu, categoryHref } from "./menu-shared";

const rows = [
  { id: "z", name: "Zebra gear", slug: "zebra", parentId: null },
  { id: "s", name: "Storage", slug: "storage", parentId: null },
  { id: "l", name: "Laptops", slug: "laptops", parentId: null },
  { id: "s2", name: "NAS", slug: "storage-nas", parentId: "s" },
  { id: "s1", name: "Internal SSD", slug: "storage-ssd", parentId: "s" },
  { id: "s3", name: "NAS Racks", slug: "storage-nas-racks", parentId: "s2" },
];

describe("buildCategoryMenu", () => {
  const menu = buildCategoryMenu(rows);

  it("puts taxonomy categories first, in taxonomy order, then staff additions", () => {
    expect(menu.map((c) => c.slug)).toEqual(["laptops", "storage", "zebra"]);
  });

  it("lists subcategories A to Z under their top-level category", () => {
    const storage = menu.find((c) => c.slug === "storage")!;
    expect(storage.children.map((c) => c.name)).toEqual([
      "Internal SSD",
      "NAS",
      "NAS Racks",
    ]);
  });

  it("gives categories with no children an empty list", () => {
    expect(menu[0].children).toEqual([]);
  });

  it("treats a category whose parent is missing as top level", () => {
    const result = buildCategoryMenu([
      { id: "a", name: "Orphan", slug: "orphan", parentId: "gone" },
    ]);
    expect(result.map((c) => c.slug)).toEqual(["orphan"]);
  });
});

describe("categoryHref", () => {
  it("filters by id when there is one", () => {
    expect(categoryHref({ id: "abc", name: "Laptops" })).toBe(
      "/search?category=abc",
    );
  });

  it("falls back to a name search without an id", () => {
    expect(categoryHref({ id: "", name: "Power & UPS" })).toBe(
      "/search?q=Power%20%26%20UPS",
    );
  });
});
