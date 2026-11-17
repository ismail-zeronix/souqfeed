import { describe, expect, it } from "vitest";
import {
  badgeFor,
  toOfferListItem,
  trendPercent,
  type LiveOfferRow,
} from "./live-mapping";

const now = new Date("2026-11-17T12:00:00Z");
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3_600_000);

const row: LiveOfferRow = {
  id: "o1",
  supplierId: "s1",
  supplierName: "Buraqa",
  supplierVerified: true,
  supplierSlug: "buraqa",
  locationName: "Bur Dubai",
  whatsappNumber: "+971500000000",
  brandId: "b1",
  brandName: "HP",
  categoryId: null,
  categoryName: null,
  title: "HP EliteBook 840 G8",
  specificationSnapshot: { ram: "16GB", cpu: "Intel Core i5", extra: 1 },
  quantity: 20,
  price: "1850",
  currency: "AED",
  priceType: "FIXED",
  availabilityStatus: "AVAILABLE",
  lastVerifiedAt: hoursAgo(10),
  publishedAt: hoursAgo(72),
  previousPrice: null,
  observationCount: 3,
};

describe("badgeFor", () => {
  it("flags a changed price first", () => {
    expect(badgeFor({ ...row, previousPrice: "1900" }, now)).toBe(
      "PRICE_UPDATED",
    );
    expect(badgeFor({ ...row, previousPrice: "1850" }, now)).toBeNull();
  });

  it("marks a first listing from the last day as new", () => {
    expect(
      badgeFor({ ...row, observationCount: 1, publishedAt: hoursAgo(3) }, now),
    ).toBe("NEW");
  });

  it("marks recently confirmed offers as live", () => {
    expect(badgeFor({ ...row, lastVerifiedAt: hoursAgo(2) }, now)).toBe("LIVE");
    expect(badgeFor(row, now)).toBeNull();
  });
});

describe("toOfferListItem", () => {
  it("orders known specs and leaves unknowns empty", () => {
    const item = toOfferListItem(row, now);
    expect(item.specLine).toEqual(["Intel Core i5", "16GB"]);
    expect(item.categoryId).toBe("");
    expect(item.price).toBe(1850);
    expect(item.supplierPositiveScorePercent).toBe(0);
    expect(item.postedAt).toBe(hoursAgo(10).toISOString());
  });

  it("keeps an unpriced offer unpriced", () => {
    const item = toOfferListItem(
      { ...row, price: null, currency: null, priceType: "ASK" },
      now,
    );
    expect(item.price).toBeNull();
    expect(item.currency).toBe("");
    expect(item.priceType).toBe("ASK");
  });
});

describe("trendPercent", () => {
  it("compares with the previous period", () => {
    expect(trendPercent(12, 10)).toBe(20);
    expect(trendPercent(5, 10)).toBe(-50);
    expect(trendPercent(5, 0)).toBe(0);
  });
});
