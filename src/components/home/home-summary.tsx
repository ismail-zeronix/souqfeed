import { CategoryShowcase } from "@/components/home/category-showcase";
import { HomeHero } from "@/components/home/home-hero";
import { LiveMarketSnapshot } from "@/components/home/live-market-snapshot";
import { SupplierCta } from "@/components/home/supplier-cta";
import type { Category } from "@/modules/categories/types";
import type { MarketStats, OfferListItem } from "@/modules/offers/types";

export function HomeSummary({
  stats,
  offers,
  categories,
}: {
  stats: MarketStats;
  offers: OfferListItem[];
  categories: Category[];
}) {
  return (
    <>
      <HomeHero stats={stats} categories={categories} />
      <LiveMarketSnapshot offers={offers} />
      <div className="bg-muted/40">
        <CategoryShowcase categories={categories} />
      </div>
      <SupplierCta />
    </>
  );
}
