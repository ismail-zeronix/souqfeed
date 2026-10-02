import { HomeSummary } from "@/components/home/home-summary";
import { getMockCategories } from "@/modules/categories/mock-data";
import {
  getMockMarketStats,
  getMockOffers,
  getMockPriceMovements,
  getMockWtbRequests,
} from "@/modules/offers/mock-data";
import { getMockSuppliers } from "@/modules/suppliers/mock-data";

export default function HomePage() {
  const stats = getMockMarketStats();
  const offers = getMockOffers();
  const categories = getMockCategories();
  const suppliers = getMockSuppliers();
  const wtbRequests = getMockWtbRequests();
  const priceMovements = getMockPriceMovements();

  return (
    <HomeSummary
      stats={stats}
      offers={offers}
      categories={categories}
      suppliers={suppliers}
      wtbRequests={wtbRequests}
      priceMovements={priceMovements}
    />
  );
}
