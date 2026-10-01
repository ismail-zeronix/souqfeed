import { describe, expect, it } from "vitest";
import { getTopBrandsByOfferCount } from "./top-brands";
import type { OfferListItem } from "./types";

function makeOffer(brandId: string, brandName: string): OfferListItem {
  return {
    id: `offer-${brandId}-${Math.random()}`,
    supplierId: "supplier-test",
    supplierName: "Test Supplier",
    supplierVerified: true,
    supplierSlug: "test-supplier",
    supplierPositiveScorePercent: 90,
    brandId,
    brandName,
    categoryId: "cat-test",
    categoryName: "Test Category",
    locationName: "Bur Dubai",
    title: "Test Product",
    specLine: [],
    quantity: 1,
    price: 100,
    currency: "AED",
    priceType: "FIXED",
    previousPrice: null,
    availabilityStatus: "AVAILABLE",
    badge: null,
    postedAt: new Date().toISOString(),
    whatsappNumber: "+971500000000",
  };
}

describe("getTopBrandsByOfferCount", () => {
  it("counts offers per brand", () => {
    const offers = [
      makeOffer("brand-a", "A"),
      makeOffer("brand-a", "A"),
      makeOffer("brand-b", "B"),
    ];
    const result = getTopBrandsByOfferCount(offers, 10);
    expect(result).toContainEqual({
      brandId: "brand-a",
      brandName: "A",
      offerCount: 2,
    });
    expect(result).toContainEqual({
      brandId: "brand-b",
      brandName: "B",
      offerCount: 1,
    });
  });

  it("ranks brands with more offers first", () => {
    const offers = [
      makeOffer("brand-a", "A"),
      makeOffer("brand-b", "B"),
      makeOffer("brand-b", "B"),
      makeOffer("brand-b", "B"),
    ];
    const result = getTopBrandsByOfferCount(offers, 10);
    expect(result[0].brandId).toBe("brand-b");
  });

  it("respects the limit", () => {
    const offers = [
      makeOffer("brand-a", "A"),
      makeOffer("brand-b", "B"),
      makeOffer("brand-c", "C"),
    ];
    const result = getTopBrandsByOfferCount(offers, 2);
    expect(result).toHaveLength(2);
  });
});
