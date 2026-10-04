import { TradingFloorView } from "@/components/feed/trading-floor-view";
import { getMockBrands } from "@/modules/brands/mock-data";
import { getMockCategories } from "@/modules/categories/mock-data";
import {
  EMPTY_OFFER_FILTERS,
  filterOffers,
  sortOffers,
} from "@/modules/offers/filter-offers";
import { paginateOffers } from "@/modules/offers/pagination";
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
    page?: string;
  }>;
}) {
  const { category, location, q, page } = await searchParams;

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
  const requestedPage = Number.parseInt(page ?? "1", 10);
  const matchingOffers = sortOffers(filterOffers(offers, initialCriteria), "recent");
  const paginatedOffers = paginateOffers(matchingOffers, requestedPage, 25);
  const paginationParams = new URLSearchParams();
  if (category) paginationParams.set("category", category);
  if (location) paginationParams.set("location", location);
  if (q) paginationParams.set("q", q);

  return (
    <TradingFloorView
      brands={brands}
      categories={categories}
      offers={paginatedOffers.items}
      currentPage={paginatedOffers.page}
      pageSize={paginatedOffers.pageSize}
      pageCount={paginatedOffers.totalPages}
      totalOfferCount={paginatedOffers.totalItems}
      paginationQuery={paginationParams.toString()}
      topSuppliers={topSuppliers}
      priceMovements={priceMovements}
      trendingSearches={trendingSearches}
      wtbRequests={wtbRequests}
      initialCriteria={initialCriteria}
    />
  );
}
