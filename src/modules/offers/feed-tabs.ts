import type { OfferListItem } from "./types";

export type FeedTab =
  "All Offers" | "New" | "Price Updated" | "In Stock" | "On Request";

export const FEED_TABS: readonly FeedTab[] = [
  "All Offers",
  "New",
  "Price Updated",
  "In Stock",
  "On Request",
];

export function matchesFeedTab(offer: OfferListItem, tab: FeedTab): boolean {
  switch (tab) {
    case "New":
      return offer.badge === "NEW";
    case "Price Updated":
      return offer.badge === "PRICE_UPDATED";
    case "In Stock":
      return offer.availabilityStatus === "AVAILABLE";
    case "On Request":
      return offer.priceType === "ASK";
    default:
      return true;
  }
}

/** How many of the given offers each feed tab would show. */
export function countFeedTabs(
  offers: OfferListItem[],
): Record<FeedTab, number> {
  return Object.fromEntries(
    FEED_TABS.map((tab) => [
      tab,
      offers.filter((offer) => matchesFeedTab(offer, tab)).length,
    ]),
  ) as Record<FeedTab, number>;
}
