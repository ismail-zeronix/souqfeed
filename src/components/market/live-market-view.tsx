"use client";

import { useState } from "react";
import { MarketHero } from "@/components/market/market-hero";
import { FiltersSidebar } from "@/components/market/filters-sidebar";
import { LiveMarketFeed } from "@/components/market/live-market-feed";
import { MarketPulseSidebar } from "@/components/market/market-pulse-sidebar";
import { EMPTY_OFFER_FILTERS } from "@/modules/offers/filter-offers";
import type {
  CategoryPriceMovement,
  MarketStats,
  OfferFilterCriteria,
  OfferListItem,
  TrendingSearchTerm,
  WtbRequestSnippet,
} from "@/modules/offers/types";
import type { Brand } from "@/modules/brands/types";
import type { Category } from "@/modules/categories/types";
import type { SupplierSummary } from "@/modules/suppliers/types";

const LOCATION_NAMES = ["Bur Dubai", "Deira", "Al Fahidi", "Al Rigga"];

export interface LiveMarketViewProps {
  brands: Brand[];
  categories: Category[];
  offers: OfferListItem[];
  stats: MarketStats;
  topSuppliers: SupplierSummary[];
  priceMovements: CategoryPriceMovement[];
  trendingSearches: TrendingSearchTerm[];
  wtbRequests: WtbRequestSnippet[];
}

export function LiveMarketView({
  brands,
  categories,
  offers,
  stats,
  topSuppliers,
  priceMovements,
  trendingSearches,
  wtbRequests,
}: LiveMarketViewProps) {
  const [criteria, setCriteria] =
    useState<OfferFilterCriteria>(EMPTY_OFFER_FILTERS);

  return (
    <>
      <MarketHero
        stats={stats}
        categories={categories}
        categoryId={criteria.categoryIds[0] ?? null}
        onCategoryChange={(categoryId) =>
          setCriteria((prev) => ({
            ...prev,
            categoryIds: categoryId ? [categoryId] : [],
          }))
        }
        searchQuery={criteria.searchQuery}
        onSearchQueryChange={(searchQuery) =>
          setCriteria((prev) => ({ ...prev, searchQuery }))
        }
      />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-6 lg:flex-row">
        <FiltersSidebar
          brands={brands}
          categories={categories}
          locationNames={LOCATION_NAMES}
          criteria={criteria}
          onCriteriaChange={setCriteria}
        />
        <LiveMarketFeed offers={offers} criteria={criteria} />
        <MarketPulseSidebar
          trendingCategories={categories}
          priceMovements={priceMovements}
          trendingSearches={trendingSearches}
          topSuppliers={topSuppliers}
          wtbRequests={wtbRequests}
        />
      </div>
    </>
  );
}
