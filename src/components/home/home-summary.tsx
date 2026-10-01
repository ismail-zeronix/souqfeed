import { CategoryShowcase } from "@/components/home/category-showcase";
import { HomeHero } from "@/components/home/home-hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { LiveTeaser } from "@/components/home/live-teaser";
import { MarketSnapshot } from "@/components/home/market-snapshot";
import { SupplierCta } from "@/components/home/supplier-cta";
import { TrustStrip } from "@/components/home/trust-strip";
import type { Category } from "@/modules/categories/types";
import type {
  MarketStats,
  OfferListItem,
  WtbRequestSnippet,
} from "@/modules/offers/types";
import type { SupplierSummary } from "@/modules/suppliers/types";

export function HomeSummary({
  stats,
  offers,
  categories,
  suppliers,
  wtbRequests,
}: {
  stats: MarketStats;
  offers: OfferListItem[];
  categories: Category[];
  suppliers: SupplierSummary[];
  wtbRequests: WtbRequestSnippet[];
}) {
  return (
    <>
      <HomeHero stats={stats} />
      <HowItWorks />
      <CategoryShowcase categories={categories} />
      <LiveTeaser offers={offers} />
      <MarketSnapshot
        offers={offers}
        suppliers={suppliers}
        wtbRequests={wtbRequests}
      />
      <SupplierCta />
      <TrustStrip suppliers={suppliers} />
    </>
  );
}
