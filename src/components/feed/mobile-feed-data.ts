import type { OfferListItem } from "@/modules/offers/types";

export function getMobileFeedOffers(
  offers: OfferListItem[],
  filters: { categoryIds?: string[] },
): OfferListItem[] {
  const categoryIds = filters.categoryIds ?? [];
  const filtered =
    categoryIds.length === 0
      ? offers
      : offers.filter((offer) => categoryIds.includes(offer.categoryId));

  return filtered.slice(0, 6);
}
