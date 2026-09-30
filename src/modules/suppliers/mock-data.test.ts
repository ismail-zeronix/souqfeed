import { describe, expect, it } from "vitest";
import { getMockSupplierBySlug, getMockSuppliers } from "./mock-data";

describe("getMockSupplierBySlug", () => {
  it("returns the matching supplier profile for a known slug", () => {
    const supplier = getMockSupplierBySlug("al-hadi-computers");
    expect(supplier?.companyName).toBe("Al Hadi Computers LLC");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getMockSupplierBySlug("does-not-exist")).toBeUndefined();
  });
});

describe("getMockSuppliers", () => {
  it("returns one summary per mock supplier, each with a positive activeOfferCount", () => {
    const suppliers = getMockSuppliers();
    expect(suppliers.length).toBeGreaterThanOrEqual(6);
    for (const supplier of suppliers) {
      expect(supplier.activeOfferCount).toBeGreaterThan(0);
    }
  });

  it("gives every supplier its own contact details, never a clone's", () => {
    const profiles = getMockSuppliers().map((summary) =>
      getMockSupplierBySlug(summary.slug)!,
    );
    const emails = profiles.map((p) => p.email);
    const whatsappNumbers = profiles.map((p) => p.whatsappNumber);
    const descriptions = profiles.map((p) => p.description);
    expect(new Set(emails).size).toBe(profiles.length);
    expect(new Set(whatsappNumbers).size).toBe(profiles.length);
    expect(new Set(descriptions).size).toBe(profiles.length);
  });
});
