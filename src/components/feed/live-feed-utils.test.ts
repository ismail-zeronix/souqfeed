import { describe, expect, it } from "vitest";
import { getLiveFeedSummary } from "@/components/feed/live-feed-utils";
import type { OfferListItem } from "@/modules/offers/types";

const offers = [
  {
    supplierId: "supplier-a",
    quantity: 120,
    availabilityStatus: "AVAILABLE",
    priceType: "FIXED",
  },
  {
    supplierId: "supplier-b",
    quantity: 70,
    availabilityStatus: "AVAILABLE",
    priceType: "ASK",
  },
  {
    supplierId: "supplier-c",
    quantity: 50,
    availabilityStatus: "LIMITED",
    priceType: "FIXED",
  },
] as OfferListItem[];

describe("getLiveFeedSummary", () => {
  it("counts offers, suppliers, and units for the live feed header", () => {
    expect(getLiveFeedSummary(offers)).toEqual({
      offerCount: 3,
      supplierCount: 3,
      unitCount: 240,
    });
  });

  it("does not report a unit total when all offers have unknown quantities", () => {
    const unknownQuantities = offers.map((offer) => ({
      ...offer,
      quantity: null,
    })) as OfferListItem[];

    expect(getLiveFeedSummary(unknownQuantities)).toEqual({
      offerCount: 3,
      supplierCount: 3,
      unitCount: null,
    });
  });
});
