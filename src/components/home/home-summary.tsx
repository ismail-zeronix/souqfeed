import { CategoryShowcase } from "@/components/home/category-showcase";
import { HomeHero } from "@/components/home/home-hero";
import { HomeStatsStrip } from "@/components/home/home-stats-strip";
import { HowItWorks } from "@/components/home/how-it-works";
import { HomeFaq } from "@/components/home/faq";
import { LiveMarketSnapshot } from "@/components/home/live-market-snapshot";
import { LocationCategoryLinks } from "@/components/home/location-category-links";
import { MobileHome } from "@/components/home/mobile/mobile-home";
import { SampleFeedback } from "@/components/home/sample-feedback";
import { SupplierCta } from "@/components/home/supplier-cta";
import { WtbRequests } from "@/components/home/wtb-requests";
import type { Category } from "@/modules/categories/types";
import type {
  MarketStats,
  OfferListItem,
  WtbRequestSnippet,
} from "@/modules/offers/types";

export const HOME_SECTION_LABELS = [
  "hero",
  "categories",
  "offers",
  "how-it-works",
  "supplier-cta",
  "feedback",
  "location-links",
] as const;

export function HomeSummary({
  stats,
  offers,
  categories,
  wtbRequests,
}: {
  stats: MarketStats;
  offers: OfferListItem[];
  categories: Category[];
  wtbRequests: WtbRequestSnippet[];
}) {
  return (
    <>
      <div className="md:hidden">
        <MobileHome
          stats={stats}
          offers={offers}
          categories={categories}
          wtbRequests={wtbRequests}
        />
      </div>
      <div className="hidden bg-[#fbfaff] md:block">
        <HomeHero stats={stats} categories={categories} />
        <HomeStatsStrip stats={stats} />
        <CategoryShowcase categories={categories} />
        <LiveMarketSnapshot offers={offers} />
        <WtbRequests requests={wtbRequests} />
        <HowItWorks />
        <SampleFeedback />
        <HomeFaq />
        <SupplierCta />
        <LocationCategoryLinks categories={categories} />
      </div>
    </>
  );
}
