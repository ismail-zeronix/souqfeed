import { describe, expect, it } from "vitest";
import { subtreeIds, toTreeOrder, wouldCreateCycle } from "./hierarchy";

const nodes = [
  { id: "laptops", name: "Laptops", parentId: null },
  { id: "gaming", name: "Gaming", parentId: "laptops" },
  { id: "business", name: "Business", parentId: "laptops" },
  { id: "rtx", name: "RTX", parentId: "gaming" },
  { id: "storage", name: "Storage", parentId: null },
];

describe("wouldCreateCycle", () => {
  it("allows moving to the top level or an unrelated parent", () => {
    expect(wouldCreateCycle(nodes, "gaming", null)).toBe(false);
    expect(wouldCreateCycle(nodes, "gaming", "storage")).toBe(false);
  });

  it("rejects a category as its own parent", () => {
    expect(wouldCreateCycle(nodes, "gaming", "gaming")).toBe(true);
  });

  it("rejects moving a category under its own descendant", () => {
    expect(wouldCreateCycle(nodes, "laptops", "rtx")).toBe(true);
  });

  it("terminates on data that already contains a cycle", () => {
    const broken = [
      { id: "a", parentId: "b" },
      { id: "b", parentId: "a" },
    ];
    expect(wouldCreateCycle(broken, "c", "a")).toBe(true);
  });
});

describe("toTreeOrder", () => {
  it("puts parents before children, alphabetically, with depth", () => {
    expect(toTreeOrder(nodes).map((node) => [node.id, node.depth])).toEqual([
      ["laptops", 0],
      ["business", 1],
      ["gaming", 1],
      ["rtx", 2],
      ["storage", 0],
    ]);
  });

  it("keeps a category whose parent is missing", () => {
    const orphan = [{ id: "x", name: "X", parentId: "gone" }];
    expect(toTreeOrder(orphan).map((node) => node.id)).toEqual(["x"]);
  });
});

describe("subtreeIds", () => {
  it("includes the category and all of its descendants", () => {
    expect([...subtreeIds(nodes, "laptops")].sort()).toEqual([
      "business",
      "gaming",
      "laptops",
      "rtx",
    ]);
  });

  it("is just the category for a leaf", () => {
    expect([...subtreeIds(nodes, "storage")]).toEqual(["storage"]);
  });
});
