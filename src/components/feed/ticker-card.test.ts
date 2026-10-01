import { describe, expect, it } from "vitest";
import { getMaskedPrice } from "./ticker-card";
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

describe("getMaskedPrice", () => {
  it("shows only the first digit of a fixed price, masking the rest", () => {
    const offer = makeOffer({
      priceType: "FIXED",
      price: 3850,
      currency: "AED",
    });
    const result = getMaskedPrice(offer);
    expect(result.visibleDigit).toBe("3");
    expect(result.maskedDigits).toBe(",850");
    expect(result.currency).toBe("AED");
    expect(result.plainLabel).toBeNull();
  });

  it("never leaves the masked portion empty for a single-digit price", () => {
    const offer = makeOffer({ priceType: "FIXED", price: 5 });
    const result = getMaskedPrice(offer);
    expect(result.visibleDigit).toBe("5");
    expect(result.maskedDigits).toBe("••");
  });

  it("has no digits to mask for ASK offers, matching the existing ASK copy", () => {
    const offer = makeOffer({ priceType: "ASK", price: null });
    const result = getMaskedPrice(offer);
    expect(result.visibleDigit).toBeNull();
    expect(result.maskedDigits).toBeNull();
    expect(result.plainLabel).toBe("ASK");
    expect(result.srLabel).toBe("Best price on request");
  });

  it("never derives a visible digit from a price the supplier marked hidden", () => {
    const offer = makeOffer({ priceType: "HIDDEN", price: 3850 });
    const result = getMaskedPrice(offer);
    expect(result.visibleDigit).toBeNull();
    expect(result.plainLabel).toBe("Hidden");
    expect(result.srLabel).toBe("Price not disclosed");
  });

  it("never derives a visible digit when the price type is unknown", () => {
    const offer = makeOffer({ priceType: "UNKNOWN", price: 3850 });
    const result = getMaskedPrice(offer);
    expect(result.visibleDigit).toBeNull();
    expect(result.plainLabel).toBe("—");
    expect(result.srLabel).toBe("Price unavailable");
  });

  it("gives a sign-in hint as the accessible label for a masked numeric price", () => {
    const offer = makeOffer({ priceType: "FIXED", price: 3850 });
    expect(getMaskedPrice(offer).srLabel).toBe(
      "Exact price hidden — sign in to view",
    );
  });
});
