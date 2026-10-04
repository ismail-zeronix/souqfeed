"use client";

import Link from "next/link";
import { Bell, Menu, Search, SlidersHorizontal } from "lucide-react";
import { MobileOfferCard } from "@/components/home/mobile/mobile-offer-card";
import { MobileEmptyState } from "@/components/home/mobile/mobile-empty-state";
import { CategoryGrid } from "@/components/home/mobile/category-grid";
import { MobileSupplierCta } from "@/components/home/mobile/mobile-supplier-cta";
import { Button } from "@/components/ui/button";
import { filterOffers } from "@/modules/offers/filter-offers";
import type { Category } from "@/modules/categories/types";
import type { OfferFilterCriteria, OfferListItem } from "@/modules/offers/types";
import { cn } from "@/lib/utils";

export function MobileTradingFeed({
  offers,
  categories,
  initialCriteria,
}: {
  offers: OfferListItem[];
  categories: Category[];
  initialCriteria: OfferFilterCriteria;
}) {
  const activeCategory = initialCriteria.categoryIds[0] ?? "";
  const visibleOffers = filterOffers(offers, initialCriteria).slice(0, 6);

  return (
    <section className="bg-background md:hidden">
      <div className="border-border bg-card sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4">
        <Menu className="size-5" aria-hidden />
        <div className="flex flex-1 items-center justify-center gap-2 text-base font-semibold">
          Live Market
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <span className="size-2 rounded-full bg-emerald-500" /> Live
          </span>
        </div>
        <Bell className="size-5" aria-hidden />
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/feed"
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-xs font-medium",
            !activeCategory
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card",
          )}
        >
          All Offers
        </Link>
        {categories.slice(0, 6).map((category) => (
          <Link
            key={category.id}
            href={`/feed?category=${category.id}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-medium",
              activeCategory === category.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card",
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-muted-foreground text-sm">
          {visibleOffers.length} live offers
        </span>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <SlidersHorizontal className="size-3.5" aria-hidden /> Filters
        </Button>
      </div>

      {initialCriteria.searchQuery && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs">
          <Search className="text-primary size-4" aria-hidden />
          <span className="truncate">{initialCriteria.searchQuery}</span>
        </div>
      )}

      <div className="flex flex-col gap-2.5 px-4">
        {visibleOffers.length > 0 ? (
          visibleOffers.map((offer) => (
            <MobileOfferCard key={offer.id} offer={offer} />
          ))
        ) : (
          <MobileEmptyState />
        )}
      </div>

      <CategoryGrid categories={categories} />
      <MobileSupplierCta />
      <div className="h-4" />
    </section>
  );
}
