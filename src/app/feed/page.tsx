import { TradingFloorView } from "@/components/feed/trading-floor-view";
import { getMockBrands } from "@/modules/brands/mock-data";
import { getMockCategories } from "@/modules/categories/mock-data";
import {
  getMockOffers,
  getMockPriceMovements,
  getMockTrendingSearches,
  getMockWtbRequests,
} from "@/modules/offers/mock-data";
import { getMockSuppliers } from "@/modules/suppliers/mock-data";

export default function FeedPage() {
  const brands = getMockBrands();
  const categories = getMockCategories();
  const offers = getMockOffers();
  const priceMovements = getMockPriceMovements();
  const trendingSearches = getMockTrendingSearches();
  const wtbRequests = getMockWtbRequests();
  const topSuppliers = [...getMockSuppliers()]
    .sort((a, b) => b.activeOfferCount - a.activeOfferCount)
    .slice(0, 4);

  return (
    <TradingFloorView
      brands={brands}
      categories={categories}
      offers={offers}
      topSuppliers={topSuppliers}
      priceMovements={priceMovements}
      trendingSearches={trendingSearches}
      wtbRequests={wtbRequests}
    />
  );
}
