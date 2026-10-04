import { HomeSummary } from "@/components/home/home-summary";
import { getMockCategories } from "@/modules/categories/mock-data";
import { getMockMarketStats, getMockOffers, getMockWtbRequests } from "@/modules/offers/mock-data";

export default function HomePage() {
  const stats = getMockMarketStats();
  const offers = getMockOffers();
  const wtbRequests = getMockWtbRequests();
  const categories = getMockCategories();

  return <HomeSummary stats={stats} offers={offers} categories={categories} wtbRequests={wtbRequests} />;
}
