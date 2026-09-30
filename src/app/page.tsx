import { LiveMarketView } from "@/components/market/live-market-view";
import { getMockBrands } from "@/modules/brands/mock-data";
import { getMockCategories } from "@/modules/categories/mock-data";
import {
  getMockMarketStats,
  getMockOffers,
  getMockPriceMovements,
  getMockTrendingSearches,
  getMockWtbRequests,
} from "@/modules/offers/mock-data";
import { getMockSuppliers } from "@/modules/suppliers/mock-data";

export default function HomePage() {
  const brands = getMockBrands();
  const categories = getMockCategories();
  const offers = getMockOffers();
  const stats = getMockMarketStats();
  const priceMovements = getMockPriceMovements();
  const trendingSearches = getMockTrendingSearches();
  const wtbRequests = getMockWtbRequests();
  const topSuppliers = [...getMockSuppliers()]
    .sort((a, b) => b.activeOfferCount - a.activeOfferCount)
    .slice(0, 4);

  return (
    <LiveMarketView
      brands={brands}
      categories={categories}
      offers={offers}
      stats={stats}
      topSuppliers={topSuppliers}
      priceMovements={priceMovements}
      trendingSearches={trendingSearches}
      wtbRequests={wtbRequests}
    />
  );
}
