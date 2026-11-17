import { logger } from "@/lib/logging/logger";
import { getMockBrands } from "@/modules/brands/mock-data";
import { listBrands } from "@/modules/brands/queries";
import type { Brand } from "@/modules/brands/types";
import { getMockCategories } from "@/modules/categories/mock-data";
import { listCategories } from "@/modules/categories/queries";
import type { Category } from "@/modules/categories/types";
import { getMockSuppliers } from "@/modules/suppliers/mock-data";
import type { SupplierSummary } from "@/modules/suppliers/types";
import {
  countLiveOffers,
  countLiveOffersByCategory,
  getLiveMarketStats,
  getMarketActivity,
  listLiveOffers,
  listTopSuppliers,
} from "./live";
import {
  getMockMarketStats,
  getMockOffers,
  getMockPriceMovements,
  getMockTrendingSearches,
  getMockWtbRequests,
} from "./mock-data";
import type {
  CategoryPriceMovement,
  MarketStats,
  OfferListItem,
  TrendingSearchTerm,
  WtbRequestSnippet,
} from "./types";

export interface MarketData {
  /**
   * "live": everything comes from real offers. "sample": no supplier has
   * published yet (or the database is unreachable), so the illustrative
   * demo data is shown, labelled as such.
   */
  mode: "live" | "sample";
  offers: OfferListItem[];
  stats: MarketStats;
  brands: Brand[];
  categories: Category[];
  topSuppliers: SupplierSummary[];
  /** Offer updates per day, last 7 days; null in sample mode. */
  activity: number[] | null;
  liveOfferCount: number;
  liveSupplierCount: number;
  // No real source yet (analytics in Phase 12, RFQs after launch), so these
  // are empty in live mode rather than invented.
  priceMovements: CategoryPriceMovement[];
  trendingSearches: TrendingSearchTerm[];
  wtbRequests: WtbRequestSnippet[];
}

function sampleData(): MarketData {
  const offers = getMockOffers();
  return {
    mode: "sample",
    offers,
    stats: getMockMarketStats(),
    brands: getMockBrands(),
    categories: getMockCategories(),
    topSuppliers: [...getMockSuppliers()]
      .sort((a, b) => b.activeOfferCount - a.activeOfferCount)
      .slice(0, 4),
    activity: null,
    liveOfferCount: offers.length,
    liveSupplierCount: getMockSuppliers().length,
    priceMovements: getMockPriceMovements(),
    trendingSearches: getMockTrendingSearches(),
    wtbRequests: getMockWtbRequests(),
  };
}

/** Data for the homepage and the live feed. */
export async function loadMarketData(): Promise<MarketData> {
  try {
    const counts = await countLiveOffers();
    if (counts.offers === 0) return sampleData();

    const [
      offers,
      stats,
      brands,
      categories,
      byCategory,
      topSuppliers,
      activity,
    ] = await Promise.all([
      listLiveOffers(),
      getLiveMarketStats(),
      listBrands(),
      listCategories(),
      countLiveOffersByCategory(),
      listTopSuppliers(),
      getMarketActivity(),
    ]);
    return {
      mode: "live",
      offers,
      stats,
      brands,
      categories: categories.map((category) => ({
        ...category,
        offerCount: byCategory.get(category.id) ?? 0,
      })),
      topSuppliers,
      activity,
      liveOfferCount: counts.offers,
      liveSupplierCount: counts.suppliers,
      priceMovements: [],
      trendingSearches: [],
      wtbRequests: [],
    };
  } catch (error) {
    // Keep the public pages up when the database isn't reachable.
    logger.error(
      { err: error },
      "Loading market data failed; showing sample data",
    );
    return sampleData();
  }
}
