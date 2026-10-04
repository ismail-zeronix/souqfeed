import { CategoryShowcase } from "@/components/home/category-showcase";
import { HowItWorks } from "@/components/home/how-it-works";
import { HomeFaq } from "@/components/home/faq";
import { SampleFeedback } from "@/components/home/sample-feedback";
import { WtbRequests } from "@/components/home/wtb-requests";
import { MarketSnapshotCard } from "@/components/home/mobile/market-snapshot-card";
import { MobileHero } from "@/components/home/mobile/mobile-hero";
import { MobileLatestOffers } from "@/components/home/mobile/mobile-latest-offers";
import { MobilePrimaryActions } from "@/components/home/mobile/mobile-primary-actions";
import { MobileSupplierCta } from "@/components/home/mobile/mobile-supplier-cta";
import { SouqFeedBrandCard } from "@/components/home/mobile/souqfeed-brand-card";
import type { Category } from "@/modules/categories/types";
import type {
  MarketStats,
  OfferListItem,
  WtbRequestSnippet,
} from "@/modules/offers/types";

export function MobileHome({
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
      <MobileHero />
      <MobilePrimaryActions />
      <MarketSnapshotCard stats={stats} />
      <CategoryShowcase categories={categories} />
      <SouqFeedBrandCard />
      <MobileLatestOffers offers={offers} />
      <WtbRequests requests={wtbRequests} />
      <MobileSupplierCta />
      <HowItWorks />
      <SampleFeedback />
      <HomeFaq />
    </>
  );
}
