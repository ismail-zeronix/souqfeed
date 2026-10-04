import { TradingFloorView } from "@/components/feed/trading-floor-view";
import { getMockBrands } from "@/modules/brands/mock-data";
import { getMockCategories } from "@/modules/categories/mock-data";
import { EMPTY_OFFER_FILTERS } from "@/modules/offers/filter-offers";
import {
  getMockOffers,
  getMockPriceMovements,
  getMockTrendingSearches,
  getMockWtbRequests,
} from "@/modules/offers/mock-data";
import type { OfferFilterCriteria } from "@/modules/offers/types";
import { getMockSuppliers } from "@/modules/suppliers/mock-data";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    location?: string;
    q?: string;
  }>;
}) {
  const { category, location, q } = await searchParams;

  const brands = getMockBrands();
  const categories = getMockCategories();
  const offers = getMockOffers();
  const priceMovements = getMockPriceMovements();
  const trendingSearches = getMockTrendingSearches();
  const wtbRequests = getMockWtbRequests();
  const topSuppliers = [...getMockSuppliers()]
    .sort((a, b) => b.activeOfferCount - a.activeOfferCount)
    .slice(0, 4);

  const initialCriteria: OfferFilterCriteria = {
    ...EMPTY_OFFER_FILTERS,
    categoryIds: category ? [category] : [],
    locationNames: location ? [location] : [],
    searchQuery: q ?? "",
  };

  return (
    <TradingFloorView
      brands={brands}
      categories={categories}
      offers={offers}
      topSuppliers={topSuppliers}
      priceMovements={priceMovements}
      trendingSearches={trendingSearches}
      wtbRequests={wtbRequests}
      initialCriteria={initialCriteria}
    />
  );
}
