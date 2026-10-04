import { HomeSummary } from "@/components/home/home-summary";
import { getMockCategories } from "@/modules/categories/mock-data";
import { getMockMarketStats, getMockOffers } from "@/modules/offers/mock-data";

export default function HomePage() {
  const stats = getMockMarketStats();
  const offers = getMockOffers();
  const categories = getMockCategories();

  return <HomeSummary stats={stats} offers={offers} categories={categories} />;
}
