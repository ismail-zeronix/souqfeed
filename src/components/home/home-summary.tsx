import { CategoryShowcase } from "@/components/home/category-showcase";
import { HomeHero } from "@/components/home/home-hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { LiveMarketSnapshot } from "@/components/home/live-market-snapshot";
import { LocationCategoryLinks } from "@/components/home/location-category-links";
import { MobileHome } from "@/components/home/mobile/mobile-home";
import { SampleFeedback } from "@/components/home/sample-feedback";
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
      <div className="md:hidden">
        <MobileHome stats={stats} offers={offers} categories={categories} />
      </div>
      <div className="hidden md:block">
        <HomeHero stats={stats} categories={categories} />
        <CategoryShowcase categories={categories} />
        <LiveMarketSnapshot offers={offers} />
        <HowItWorks />
        <SampleFeedback />
        <SupplierCta />
        <LocationCategoryLinks categories={categories} />
      </div>
    </>
  );
}
