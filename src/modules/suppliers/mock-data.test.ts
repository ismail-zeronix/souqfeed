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
});
