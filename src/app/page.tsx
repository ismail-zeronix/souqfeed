import { HomeSummary } from "@/components/home/home-summary";
import { loadMarketData } from "@/modules/offers/market-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await loadMarketData();

  return (
    <HomeSummary
      stats={data.stats}
      offers={data.offers}
      categories={data.categories}
      wtbRequests={data.wtbRequests}
      sample={data.mode === "sample"}
    />
  );
}
