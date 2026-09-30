import { describe, expect, it } from "vitest";
import { EMPTY_OFFER_FILTERS, filterOffers, sortOffers } from "./filter-offers";
import type { OfferListItem } from "./types";

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
    specLine: ["Spec A", "Spec B"],
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

describe("filterOffers", () => {
  it("returns all offers when criteria is empty", () => {
    const offers = [makeOffer({ id: "a" }), makeOffer({ id: "b" })];
    expect(filterOffers(offers, EMPTY_OFFER_FILTERS)).toHaveLength(2);
  });

  it("filters by brandIds", () => {
    const offers = [
      makeOffer({ id: "a", brandId: "brand-lenovo" }),
      makeOffer({ id: "b", brandId: "brand-hp" }),
    ];
    const result = filterOffers(offers, { ...EMPTY_OFFER_FILTERS, brandIds: ["brand-lenovo"] });
    expect(result.map((o) => o.id)).toEqual(["a"]);
  });

  it("filters by categoryIds", () => {
    const offers = [
      makeOffer({ id: "a", categoryId: "cat-laptops" }),
      makeOffer({ id: "b", categoryId: "cat-storage" }),
    ];
    const result = filterOffers(offers, { ...EMPTY_OFFER_FILTERS, categoryIds: ["cat-storage"] });
    expect(result.map((o) => o.id)).toEqual(["b"]);
  });

  it("filters by locationNames", () => {
    const offers = [
      makeOffer({ id: "a", locationName: "Bur Dubai" }),
      makeOffer({ id: "b", locationName: "Deira" }),
    ];
    const result = filterOffers(offers, { ...EMPTY_OFFER_FILTERS, locationNames: ["Deira"] });
    expect(result.map((o) => o.id)).toEqual(["b"]);
  });

  it("filters out-of-stock offers when inStockOnly is true", () => {
    const offers = [
      makeOffer({ id: "a", availabilityStatus: "AVAILABLE" }),
      makeOffer({ id: "b", availabilityStatus: "SOLD_OUT" }),
    ];
    const result = filterOffers(offers, { ...EMPTY_OFFER_FILTERS, inStockOnly: true });
    expect(result.map((o) => o.id)).toEqual(["a"]);
  });

  it("matches searchQuery against title, brand, and spec line, case-insensitively", () => {
    const offers = [
      makeOffer({ id: "a", title: "ThinkPad E14 Gen 7", brandName: "Lenovo", specLine: ["16GB RAM"] }),
      makeOffer({ id: "b", title: "OptiPlex 7020", brandName: "Dell", specLine: ["8GB RAM"] }),
    ];
    const result = filterOffers(offers, { ...EMPTY_OFFER_FILTERS, searchQuery: "thinkpad" });
    expect(result.map((o) => o.id)).toEqual(["a"]);
  });

  it("combines multiple criteria with AND semantics", () => {
    const offers = [
      makeOffer({ id: "a", brandId: "brand-lenovo", categoryId: "cat-laptops" }),
      makeOffer({ id: "b", brandId: "brand-lenovo", categoryId: "cat-storage" }),
    ];
    const result = filterOffers(offers, {
      ...EMPTY_OFFER_FILTERS,
      brandIds: ["brand-lenovo"],
      categoryIds: ["cat-laptops"],
    });
    expect(result.map((o) => o.id)).toEqual(["a"]);
  });

  it("returns an empty array when nothing matches", () => {
    const offers = [makeOffer({ id: "a", brandId: "brand-lenovo" })];
    const result = filterOffers(offers, { ...EMPTY_OFFER_FILTERS, brandIds: ["brand-hp"] });
    expect(result).toEqual([]);
  });
});

describe("sortOffers", () => {
  it("sorts by most recent first", () => {
    const older = makeOffer({ id: "old", postedAt: new Date(Date.now() - 100000).toISOString() });
    const newer = makeOffer({ id: "new", postedAt: new Date().toISOString() });
    expect(sortOffers([older, newer], "recent").map((o) => o.id)).toEqual(["new", "old"]);
  });

  it("sorts by price ascending, treating a null (ASK) price as highest", () => {
    const cheap = makeOffer({ id: "cheap", price: 100 });
    const askPrice = makeOffer({ id: "ask", price: null, priceType: "ASK" });
    const mid = makeOffer({ id: "mid", price: 500 });
    expect(sortOffers([mid, askPrice, cheap], "price-asc").map((o) => o.id)).toEqual([
      "cheap",
      "mid",
      "ask",
    ]);
  });

  it("sorts by price descending, treating a null (ASK) price as lowest", () => {
    const cheap = makeOffer({ id: "cheap", price: 100 });
    const askPrice = makeOffer({ id: "ask", price: null, priceType: "ASK" });
    const mid = makeOffer({ id: "mid", price: 500 });
    expect(sortOffers([cheap, askPrice, mid], "price-desc").map((o) => o.id)).toEqual([
      "mid",
      "cheap",
      "ask",
    ]);
  });

  it("does not mutate the input array", () => {
    const offers = [makeOffer({ id: "a", price: 500 }), makeOffer({ id: "b", price: 100 })];
    const original = [...offers];
    sortOffers(offers, "price-asc");
    expect(offers).toEqual(original);
  });
});
