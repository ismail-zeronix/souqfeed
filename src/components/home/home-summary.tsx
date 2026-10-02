import { CategoryShowcase } from "@/components/home/category-showcase";
import { HomeHero } from "@/components/home/home-hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { KeywordCloud } from "@/components/home/keyword-cloud";
import { LiveTeaser } from "@/components/home/live-teaser";
import { MarketIntelligence } from "@/components/home/market-intelligence";
import { MarketSnapshot } from "@/components/home/market-snapshot";
import { SupplierCta } from "@/components/home/supplier-cta";
import { TrustStrip } from "@/components/home/trust-strip";
import type { Category } from "@/modules/categories/types";
import type {
  CategoryPriceMovement,
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
  priceMovements,
}: {
  stats: MarketStats;
  offers: OfferListItem[];
  categories: Category[];
  suppliers: SupplierSummary[];
  wtbRequests: WtbRequestSnippet[];
  priceMovements: CategoryPriceMovement[];
}) {
  return (
    <>
      <HomeHero stats={stats} />
      <HowItWorks />
      <div className="bg-muted/40">
        <CategoryShowcase categories={categories} />
      </div>
      <LiveTeaser offers={offers} />
      <div className="bg-muted/40">
        <MarketSnapshot
          offers={offers}
          suppliers={suppliers}
          wtbRequests={wtbRequests}
        />
      </div>
      <MarketIntelligence priceMovements={priceMovements} stats={stats} />
      <SupplierCta />
      <TrustStrip suppliers={suppliers} />
      <KeywordCloud categories={categories} />
    </>
  );
}
