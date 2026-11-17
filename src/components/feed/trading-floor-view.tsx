"use client";

import { useState } from "react";
import {
  MarketPulseSidebar,
  type MarketPulse,
} from "@/components/market/market-pulse-sidebar";
import { SampleDataNotice } from "@/components/market/sample-data-notice";
import type { FeedTab } from "@/modules/offers/feed-tabs";
import { LiveTradingFeed } from "@/components/feed/live-trading-feed";
import { MobileTradingFeed } from "@/components/feed/mobile-trading-feed";
import { EMPTY_OFFER_FILTERS } from "@/modules/offers/filter-offers";
import { LOCATION_NAMES } from "@/modules/offers/constants";
import type {
  CategoryPriceMovement,
  OfferFilterCriteria,
  OfferListItem,
  TrendingSearchTerm,
  WtbRequestSnippet,
} from "@/modules/offers/types";
import type { Brand } from "@/modules/brands/types";
import type { Category } from "@/modules/categories/types";
import type { SupplierSummary } from "@/modules/suppliers/types";

export interface TradingFloorViewProps {
  brands: Brand[];
  categories: Category[];
  offers: OfferListItem[];
  topSuppliers: SupplierSummary[];
  priceMovements: CategoryPriceMovement[];
  trendingSearches: TrendingSearchTerm[];
  wtbRequests: WtbRequestSnippet[];
  initialCriteria?: OfferFilterCriteria;
  currentPage: number;
  pageSize: number;
  pageCount: number;
  totalOfferCount: number;
  paginationQuery: string;
  /** Real market activity; absent while the feed shows sample listings. */
  pulse?: MarketPulse;
  sample?: boolean;
  tabCounts: Record<FeedTab, number>;
}

export function TradingFloorView({
  brands,
  categories,
  offers,
  topSuppliers,
  priceMovements,
  trendingSearches,
  wtbRequests,
  initialCriteria,
  currentPage,
  pageSize,
  pageCount,
  totalOfferCount,
  paginationQuery,
  pulse,
  sample = false,
  tabCounts,
}: TradingFloorViewProps) {
  const [criteria, setCriteria] = useState(
    initialCriteria ?? EMPTY_OFFER_FILTERS,
  );

  return (
    <>
      {sample && <SampleDataNotice />}
      <MobileTradingFeed
        offers={offers}
        categories={categories}
        initialCriteria={initialCriteria ?? EMPTY_OFFER_FILTERS}
      />
      <div className="hidden min-h-full w-full bg-[#f7f8fc] md:block">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-4 md:flex-row md:px-5 lg:gap-4 lg:px-6">
          <LiveTradingFeed
            offers={offers}
            criteria={criteria}
            brands={brands}
            categories={categories}
            locationNames={LOCATION_NAMES}
            onCriteriaChange={setCriteria}
            currentPage={currentPage}
            pageSize={pageSize}
            pageCount={pageCount}
            totalOfferCount={totalOfferCount}
            paginationQuery={paginationQuery}
            tabCounts={tabCounts}
            simulateArrivals={sample}
          />
          <MarketPulseSidebar
            trendingCategories={categories}
            priceMovements={priceMovements}
            trendingSearches={trendingSearches}
            topSuppliers={topSuppliers}
            wtbRequests={wtbRequests}
            pulse={pulse}
          />
        </div>
      </div>
    </>
  );
}
