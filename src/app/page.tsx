"use client";

import { useState } from "react";
import { MarketHero } from "@/components/market/market-hero";
import { FiltersSidebar } from "@/components/market/filters-sidebar";
import { LiveMarketFeed } from "@/components/market/live-market-feed";
import { MarketPulseSidebar } from "@/components/market/market-pulse-sidebar";
import { getMockBrands } from "@/modules/brands/mock-data";
import { getMockCategories } from "@/modules/categories/mock-data";
import { EMPTY_OFFER_FILTERS } from "@/modules/offers/filter-offers";
import { getMockMarketStats, getMockOffers } from "@/modules/offers/mock-data";
import { getMockSuppliers } from "@/modules/suppliers/mock-data";
import type { OfferFilterCriteria } from "@/modules/offers/types";

const LOCATION_NAMES = ["Bur Dubai", "Deira", "Al Fahidi", "Al Rigga"];

export default function HomePage() {
  const [criteria, setCriteria] = useState<OfferFilterCriteria>(EMPTY_OFFER_FILTERS);

  const brands = getMockBrands();
  const categories = getMockCategories();
  const offers = getMockOffers();
  const stats = getMockMarketStats();
  const topSuppliers = [...getMockSuppliers()]
    .sort((a, b) => b.activeOfferCount - a.activeOfferCount)
    .slice(0, 4);

  return (
    <>
      <MarketHero
        stats={stats}
        categories={categories}
        categoryId={criteria.categoryIds[0] ?? null}
        onCategoryChange={(categoryId) =>
          setCriteria((prev) => ({ ...prev, categoryIds: categoryId ? [categoryId] : [] }))
        }
        searchQuery={criteria.searchQuery}
        onSearchQueryChange={(searchQuery) => setCriteria((prev) => ({ ...prev, searchQuery }))}
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
        <MarketPulseSidebar trendingCategories={categories} topSuppliers={topSuppliers} />
      </div>
    </>
  );
}
