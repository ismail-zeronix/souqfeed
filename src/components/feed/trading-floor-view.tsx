"use client";

import { useState } from "react";
import { FiltersSidebar } from "@/components/market/filters-sidebar";
import { MarketPulseSidebar } from "@/components/market/market-pulse-sidebar";
import { LiveTradingFeed } from "@/components/feed/live-trading-feed";
import { EMPTY_OFFER_FILTERS } from "@/modules/offers/filter-offers";
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

const LOCATION_NAMES = ["Bur Dubai", "Deira", "Al Fahidi", "Al Rigga"];

export interface TradingFloorViewProps {
  brands: Brand[];
  categories: Category[];
  offers: OfferListItem[];
  topSuppliers: SupplierSummary[];
  priceMovements: CategoryPriceMovement[];
  trendingSearches: TrendingSearchTerm[];
  wtbRequests: WtbRequestSnippet[];
}

export function TradingFloorView({
  brands,
  categories,
  offers,
  topSuppliers,
  priceMovements,
  trendingSearches,
  wtbRequests,
}: TradingFloorViewProps) {
  const [criteria, setCriteria] =
    useState<OfferFilterCriteria>(EMPTY_OFFER_FILTERS);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-6 lg:flex-row">
      <FiltersSidebar
        brands={brands}
        categories={categories}
        locationNames={LOCATION_NAMES}
        criteria={criteria}
        onCriteriaChange={setCriteria}
      />
      <LiveTradingFeed offers={offers} criteria={criteria} />
      <MarketPulseSidebar
        trendingCategories={categories}
        priceMovements={priceMovements}
        trendingSearches={trendingSearches}
        topSuppliers={topSuppliers}
        wtbRequests={wtbRequests}
      />
    </div>
  );
}
