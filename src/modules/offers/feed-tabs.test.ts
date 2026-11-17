import { describe, expect, it } from "vitest";
import { countFeedTabs } from "./feed-tabs";
import type { OfferListItem } from "./types";

const offer = (overrides: Partial<OfferListItem>): OfferListItem =>
  ({
    badge: null,
    availabilityStatus: "UNKNOWN",
    priceType: "FIXED",
    ...overrides,
  }) as OfferListItem;

describe("countFeedTabs", () => {
  it("counts each tab from the offers themselves", () => {
    expect(
      countFeedTabs([
        offer({ badge: "NEW", availabilityStatus: "AVAILABLE" }),
        offer({ badge: "PRICE_UPDATED" }),
        offer({ priceType: "ASK", availabilityStatus: "ASK" }),
      ]),
    ).toEqual({
      "All Offers": 3,
      New: 1,
      "Price Updated": 1,
      "In Stock": 1,
      "On Request": 1,
    });
  });

  it("is all zeros for no offers", () => {
    expect(countFeedTabs([])["All Offers"]).toBe(0);
  });
});
