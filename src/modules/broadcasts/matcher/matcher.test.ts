import { describe, expect, it } from "vitest";
import {
  AUTO_APPROVE_AT,
  decideMatch,
  type Candidate,
  type CandidateSets,
  type MatchItem,
} from "./decide";
import { capacityInGb, compareSpecs, cpuModelToken } from "./specs";

const EMPTY: CandidateSets = {
  partNumber: [],
  brandModel: [],
  alias: [],
  familySpec: [],
  fuzzy: [],
};

const item: MatchItem = {
  brand: "HP",
  model: "EliteBook 840 G8",
  partNumber: null,
  cpu: "Intel Core i5-1145G7",
  ram: "16GB",
  storage: "512GB",
};

const product = (
  productId: string,
  specifications: unknown = null,
  brandName = "HP",
): Candidate => ({
  productId,
  title: `${brandName} product ${productId}`,
  brandName,
  specifications,
});

describe("spec helpers", () => {
  it("reads capacities in GB", () => {
    expect(capacityInGb("16GB")).toBe(16);
    expect(capacityInGb("512 GB SSD")).toBe(512);
    expect(capacityInGb("1TB")).toBe(1024);
    expect(capacityInGb("lots")).toBeNull();
  });

  it("reads the identifying part of a CPU name", () => {
    expect(cpuModelToken("Intel Core i5-1235U")).toBe("1235U");
    expect(cpuModelToken("i3-N305")).toBe("N305");
    expect(cpuModelToken("Intel Core Ultra 7 155H")).toBe("155H");
    expect(cpuModelToken("Apple M2 Pro")).toBe("M2 PRO");
    expect(cpuModelToken("Intel Core i5")).toBeNull();
  });

  it("only compares specs both sides state", () => {
    expect(
      compareSpecs(item, { cpu: "Core i5-1145G7", ram: "16 GB", os: "W11" }),
    ).toEqual({ agreements: ["CPU 1145G7", "RAM 16GB"], conflicts: [] });
    expect(compareSpecs(item, { ram: "8GB", storage: "0.5TB" })).toEqual({
      agreements: ["Storage 512GB"],
      conflicts: ["RAM differs: 16GB vs 8GB"],
    });
    expect(compareSpecs(item, null)).toEqual({ agreements: [], conflicts: [] });
  });
});

describe("decideMatch", () => {
  it("auto-approves an exact part number match", () => {
    const match = decideMatch(
      { ...item, partNumber: "6A1Q9EA" },
      { ...EMPTY, partNumber: [product("p1")] },
    );
    expect(match).toMatchObject({
      productId: "p1",
      method: "PART_NUMBER",
      confidence: 0.98,
      reviewStatus: "AUTO_APPROVED",
    });
    expect(match.reasons[0]).toContain("6A1Q9EA");
  });

  it("follows the documented priority order", () => {
    const match = decideMatch(item, {
      ...EMPTY,
      alias: [product("alias")],
      brandModel: [product("model")],
      fuzzy: [{ ...product("fuzzy"), similarity: 0.9 }],
    });
    expect(match.productId).toBe("model");
    expect(match.method).toBe("BRAND_MODEL");
  });

  it("never uses a candidate from a different brand", () => {
    const match = decideMatch(item, {
      ...EMPTY,
      partNumber: [product("dell", null, "Dell")],
      alias: [product("hp")],
    });
    expect(match.productId).toBe("hp");
    expect(match.method).toBe("ALIAS");
  });

  it("sends spec conflicts to review with the reason", () => {
    const match = decideMatch(item, {
      ...EMPTY,
      brandModel: [product("p1", { ram: "8GB" })],
    });
    expect(match.confidence).toBeLessThan(AUTO_APPROVE_AT);
    expect(match.reviewStatus).toBe("NEEDS_REVIEW");
    expect(match.reasons).toContain("RAM differs: 16GB vs 8GB");
  });

  it("lets specs choose between several candidates", () => {
    const match = decideMatch(item, {
      ...EMPTY,
      brandModel: [
        product("8gb", { ram: "8GB" }),
        product("16gb", { ram: "16GB", storage: "512GB" }),
      ],
    });
    expect(match).toMatchObject({
      productId: "16gb",
      reviewStatus: "AUTO_APPROVED",
    });
  });

  it("only suggests when several candidates can't be told apart", () => {
    const match = decideMatch(item, {
      ...EMPTY,
      brandModel: [product("a"), product("b")],
    });
    expect(match).toMatchObject({
      productId: "a",
      confidence: 0.6,
      reviewStatus: "NEEDS_REVIEW",
    });
  });

  it("never auto-approves a fuzzy match", () => {
    const match = decideMatch(item, {
      ...EMPTY,
      fuzzy: [{ ...product("p1"), similarity: 1 }],
    });
    expect(match.method).toBe("FUZZY");
    expect(match.confidence).toBe(0.8);
    expect(match.reviewStatus).toBe("NEEDS_REVIEW");
  });

  it("reports no match without inventing a product (Rule 10)", () => {
    expect(decideMatch(item, EMPTY)).toEqual({
      productId: null,
      confidence: 0,
      method: "NONE",
      reasons: ["No catalog product matched"],
      reviewStatus: "NEEDS_REVIEW",
    });
  });
});
