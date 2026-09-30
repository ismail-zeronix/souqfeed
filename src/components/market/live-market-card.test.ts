import { describe, expect, it } from "vitest";
import { formatPrice, formatRelativeTime } from "./live-market-card";
import type { OfferListItem } from "@/modules/offers/types";

function makeOffer(overrides: Partial<OfferListItem>): OfferListItem {
  return {
    id: "offer-test",
    supplierId: "supplier-test",
    supplierName: "Test Supplier",
    supplierVerified: true,
    supplierSlug: "test-supplier",
    supplierPositiveScorePercent: 95,
    brandId: "brand-test",
    brandName: "TestBrand",
    categoryId: "cat-test",
    categoryName: "Test Category",
    locationName: "Bur Dubai",
    title: "Test Product",
    specLine: ["Spec A"],
    quantity: 10,
    price: 100,
    currency: "AED",
    priceType: "FIXED",
    previousPrice: null,
    availabilityStatus: "AVAILABLE",
    badge: null,
    postedAt: new Date().toISOString(),
    whatsappNumber: "+971500000000",
    ...overrides,
  };
}

describe("formatPrice", () => {
  it("renders ASK offers as 'ASK' with a request-price hint, never a null price", () => {
    const offer = makeOffer({ priceType: "ASK", price: null });
    const result = formatPrice(offer);
    expect(result.primary).toBe("ASK");
    expect(result.secondary).toBe("Best price on request");
  });

  it("renders a fixed price with the currency and thousands separators", () => {
    const offer = makeOffer({
      priceType: "FIXED",
      price: 3850,
      currency: "AED",
    });
    expect(formatPrice(offer).primary).toBe("AED 3,850");
  });

  it("shows the previous price when it is higher (a price drop)", () => {
    const offer = makeOffer({
      priceType: "FIXED",
      price: 540,
      previousPrice: 570,
    });
    expect(formatPrice(offer).secondary).toBe("Was 570");
  });

  it("shows a bulk-price hint for high-quantity fixed offers with no prior price", () => {
    const offer = makeOffer({
      priceType: "FIXED",
      price: 3850,
      quantity: 120,
      previousPrice: null,
    });
    expect(formatPrice(offer).secondary).toBe("Bulk price available");
  });
});

describe("formatRelativeTime", () => {
  it("formats minutes for anything under an hour", () => {
    expect(
      formatRelativeTime(new Date(Date.now() - 2 * 60_000).toISOString()),
    ).toBe("2m ago");
  });

  it("formats hours for anything under a day", () => {
    expect(
      formatRelativeTime(new Date(Date.now() - 3 * 3_600_000).toISOString()),
    ).toBe("3h ago");
  });
});
