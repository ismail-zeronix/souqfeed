import type { OfferListItem } from "./types";

export interface BrandRanking {
  brandId: string;
  brandName: string;
  offerCount: number;
}

export function getTopBrandsByOfferCount(
  offers: OfferListItem[],
  limit: number,
): BrandRanking[] {
  const counts = new Map<string, BrandRanking>();

  for (const offer of offers) {
    const existing = counts.get(offer.brandId);
    if (existing) {
      existing.offerCount += 1;
    } else {
      counts.set(offer.brandId, {
        brandId: offer.brandId,
        brandName: offer.brandName,
        offerCount: 1,
      });
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.offerCount - a.offerCount)
    .slice(0, limit);
}
