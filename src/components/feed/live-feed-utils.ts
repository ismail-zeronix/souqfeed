import type { OfferListItem } from "@/modules/offers/types";

export interface LiveFeedSummary {
  offerCount: number;
  supplierCount: number;
  unitCount: number | null;
}

export function getLiveFeedSummary(
  offers: OfferListItem[],
): LiveFeedSummary {
  const quantities = offers
    .map((offer) => offer.quantity)
    .filter((quantity): quantity is number => quantity !== null);

  return {
    offerCount: offers.length,
    supplierCount: new Set(offers.map((offer) => offer.supplierId)).size,
    unitCount:
      quantities.length > 0
        ? quantities.reduce((sum, quantity) => sum + quantity, 0)
        : null,
  };
}
