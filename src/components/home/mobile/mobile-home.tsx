import { CategoryGrid } from "@/components/home/mobile/category-grid";
import { MarketSnapshotCard } from "@/components/home/mobile/market-snapshot-card";
import { MobileHero } from "@/components/home/mobile/mobile-hero";
import { MobileLatestOffers } from "@/components/home/mobile/mobile-latest-offers";
import { MobilePrimaryActions } from "@/components/home/mobile/mobile-primary-actions";
import { MobileSearchBar } from "@/components/home/mobile/mobile-search-bar";
import { MobileSupplierCta } from "@/components/home/mobile/mobile-supplier-cta";
import { SouqFeedBrandCard } from "@/components/home/mobile/souqfeed-brand-card";
import type { Category } from "@/modules/categories/types";
import type { MarketStats, OfferListItem } from "@/modules/offers/types";

export function MobileHome({
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
      <MobileHero />
      <MobileSearchBar />
      <MobilePrimaryActions />
      <MarketSnapshotCard stats={stats} />
      <CategoryGrid categories={categories} />
      <SouqFeedBrandCard />
      <MobileLatestOffers offers={offers} />
      <MobileSupplierCta />
    </>
  );
}
