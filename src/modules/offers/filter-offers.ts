import type { OfferFilterCriteria, OfferListItem } from "./types";

export const EMPTY_OFFER_FILTERS: OfferFilterCriteria = {
  brandIds: [],
  categoryIds: [],
  locationNames: [],
  inStockOnly: false,
  searchQuery: "",
};

export function filterOffers(
  offers: OfferListItem[],
  criteria: OfferFilterCriteria,
): OfferListItem[] {
  const query = criteria.searchQuery.trim().toLowerCase();

  return offers.filter((offer) => {
    if (criteria.brandIds.length > 0 && !criteria.brandIds.includes(offer.brandId)) {
      return false;
    }
    if (criteria.categoryIds.length > 0 && !criteria.categoryIds.includes(offer.categoryId)) {
      return false;
    }
    if (
      criteria.locationNames.length > 0 &&
      !criteria.locationNames.includes(offer.locationName)
    ) {
      return false;
    }
    if (criteria.inStockOnly && offer.availabilityStatus !== "AVAILABLE") {
      return false;
    }
    if (query.length > 0) {
      const haystack = `${offer.title} ${offer.brandName} ${offer.specLine.join(" ")}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });
}

export type SortOption = "recent" | "price-asc" | "price-desc";

export function sortOffers(offers: OfferListItem[], sort: SortOption): OfferListItem[] {
  const copy = [...offers];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    case "price-desc":
      return copy.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    case "recent":
    default:
      return copy.sort(
        (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
      );
  }
}
