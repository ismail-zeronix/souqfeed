import { TradingFloorView } from "@/components/feed/trading-floor-view";
import {
  EMPTY_OFFER_FILTERS,
  filterOffers,
  sortOffers,
} from "@/modules/offers/filter-offers";
import { countFeedTabs } from "@/modules/offers/feed-tabs";
import { loadMarketData } from "@/modules/offers/market-data";
import { paginateOffers } from "@/modules/offers/pagination";
import type { OfferFilterCriteria } from "@/modules/offers/types";

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
  const data = await loadMarketData();

  const initialCriteria: OfferFilterCriteria = {
    ...EMPTY_OFFER_FILTERS,
    categoryIds: category ? [category] : [],
    locationNames: location ? [location] : [],
    searchQuery: q ?? "",
  };
  const requestedPage = Number.parseInt(page ?? "1", 10);
  const filteredOffers = filterOffers(data.offers, initialCriteria);
  const matchingOffers = sortOffers(filteredOffers, "recent");
  const paginatedOffers = paginateOffers(matchingOffers, requestedPage, 25);
  const paginationParams = new URLSearchParams();
  if (category) paginationParams.set("category", category);
  if (location) paginationParams.set("location", location);
  if (q) paginationParams.set("q", q);

  return (
    <TradingFloorView
      brands={data.brands}
      categories={data.categories}
      offers={paginatedOffers.items}
      currentPage={paginatedOffers.page}
      pageSize={paginatedOffers.pageSize}
      pageCount={paginatedOffers.totalPages}
      totalOfferCount={paginatedOffers.totalItems}
      paginationQuery={paginationParams.toString()}
      topSuppliers={data.topSuppliers}
      priceMovements={data.priceMovements}
      trendingSearches={data.trendingSearches}
      wtbRequests={data.wtbRequests}
      initialCriteria={initialCriteria}
      sample={data.mode === "sample"}
      tabCounts={countFeedTabs(filteredOffers)}
      pulse={
        data.activity
          ? {
              liveOffers: data.liveOfferCount,
              activeSuppliers: data.liveSupplierCount,
              activity: data.activity,
            }
          : undefined
      }
    />
  );
}
