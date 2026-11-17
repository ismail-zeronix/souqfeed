import { describe, expect, it } from "vitest";
import { toSupplierFormValues, toSupplierProfile } from "./profile";
import type { SupplierRecord } from "./types";

function makeRow(overrides: Partial<SupplierRecord> = {}): SupplierRecord {
  return {
    id: "row-1",
    userId: "user-1",
    companyName: "Fresh Supplier Co",
    slug: "fresh-supplier-co",
    logo: null,
    description: "A brand new supplier",
    whatsappNumber: "+971500000001",
    phone: null,
    email: null,
    website: "https://example.com",
    locationName: null,
    address: null,
    googleMapsUrl: null,
    verified: false,
    active: true,
    createdAt: new Date("2026-01-15T00:00:00.000Z"),
    updatedAt: new Date("2026-01-15T00:00:00.000Z"),
    ...overrides,
  };
}

describe("toSupplierProfile", () => {
  it("uses the real row's identity and contact fields", () => {
    const profile = toSupplierProfile(makeRow());
    expect(profile.companyName).toBe("Fresh Supplier Co");
    expect(profile.whatsappNumber).toBe("+971500000001");
    expect(profile.website).toBe("https://example.com");
    expect(profile.verified).toBe(false);
    expect(profile.memberSinceYear).toBe(2026);
  });

  it("derives logoInitial from companyName", () => {
    expect(
      toSupplierProfile(makeRow({ companyName: "zelda traders" })).logoInitial,
    ).toBe("Z");
  });

  it("zero-states metrics that have no backing data", () => {
    const profile = toSupplierProfile(makeRow());
    expect(profile.topBrands).toEqual([]);
    expect(profile.categoryMix).toEqual([]);
    expect(profile.broadcastActivity).toEqual([]);
    expect(profile.businessHours).toEqual([]);
    expect(profile.activeOfferCount).toBe(0);
    expect(profile.positiveScorePercent).toBe(0);
    expect(profile.avgResponseTimeLabel).toBe("—");
  });

  it("never reports a broadcast that did not happen", () => {
    expect(toSupplierProfile(makeRow()).lastBroadcastAt).toBeNull();
  });

  it("does not borrow mock metrics when a row's slug matches a demo supplier", () => {
    const profile = toSupplierProfile(
      makeRow({ slug: "al-hadi-computers", companyName: "Al Hadi Computers" }),
    );
    expect(profile.activeOfferCount).toBe(0);
    expect(profile.topBrands).toEqual([]);
    expect(profile.positiveScorePercent).toBe(0);
  });

  it("uses the supplier's own category and brand selections as tags", () => {
    const profile = toSupplierProfile(makeRow(), {
      brandNames: ["HP"],
      categoryNames: ["Laptops"],
    });
    expect(profile.tags).toEqual(["Laptops", "HP"]);
  });

  it("shows a dash when no location was given", () => {
    expect(toSupplierProfile(makeRow()).locationName).toBe("—");
  });
});

describe("toSupplierFormValues", () => {
  it("returns blank values for a supplier with no profile yet", () => {
    const values = toSupplierFormValues(undefined);
    expect(values.companyName).toBe("");
    expect(values.brandIds).toEqual([]);
  });

  it("turns null columns into empty strings and keeps associations", () => {
    const values = toSupplierFormValues({
      ...makeRow(),
      brandIds: ["b1"],
      categoryIds: ["c1"],
    });
    expect(values.phone).toBe("");
    expect(values.website).toBe("https://example.com");
    expect(values.brandIds).toEqual(["b1"]);
    expect(values.categoryIds).toEqual(["c1"]);
  });

  it("contains no admin-owned fields", () => {
    const values = toSupplierFormValues({
      ...makeRow({ verified: true }),
      brandIds: [],
      categoryIds: [],
    });
    expect(values).not.toHaveProperty("verified");
    expect(values).not.toHaveProperty("active");
    expect(values).not.toHaveProperty("slug");
    expect(values).not.toHaveProperty("userId");
  });
});
