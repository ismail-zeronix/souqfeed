import { BrandMarquee } from "@/components/home/sections/brand-marquee";
import { BroadcastToOffers } from "@/components/home/sections/broadcast-to-offers";
import { FeatureCards } from "@/components/home/sections/feature-cards";
import { SupplierCta } from "@/components/home/supplier-cta";
import { CategoryTiles } from "@/components/home/mobile/category-tiles";
import { HomeSearch } from "@/components/home/home-search";
import { HowItWorks } from "@/components/home/how-it-works";
import { HomeFaq } from "@/components/home/faq";
import { SampleFeedback } from "@/components/home/sample-feedback";
import { WtbRequests } from "@/components/home/wtb-requests";
import { MarketSnapshotCard } from "@/components/home/mobile/market-snapshot-card";
import { MobileHero } from "@/components/home/mobile/mobile-hero";
import { MobileLatestOffers } from "@/components/home/mobile/mobile-latest-offers";
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
      <MobileHero offers={offers} />
      <HomeSearch className="px-4 pt-4" />
      <MarketSnapshotCard stats={stats} />
      <CategoryTiles categories={categories} />
      <BrandMarquee />
      <FeatureCards offers={offers} />
      <MobileLatestOffers offers={offers} />
      <BroadcastToOffers />
      <WtbRequests requests={wtbRequests} />
      <SupplierCta />
      <HowItWorks />
      <SampleFeedback />
      <HomeFaq />
    </>
  );
}
