"use client";

import { LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LiveMarketCard } from "@/components/market/live-market-card";
import { filterOffers, sortOffers, type SortOption } from "@/modules/offers/filter-offers";
import type { OfferFilterCriteria, OfferListItem } from "@/modules/offers/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function LiveMarketFeed({ offers, criteria }: { offers: OfferListItem[]; criteria: OfferFilterCriteria }) {
  const [sort, setSort] = useState<SortOption>("recent");
  const [view, setView] = useState<"list" | "grid">("list");

  const visibleOffers = useMemo(() => sortOffers(filterOffers(offers, criteria), sort), [offers, criteria, sort]);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="size-2 rounded-full bg-live" aria-hidden />
          LIVE MARKET
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List className="size-4" aria-hidden />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      {visibleOffers.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No offers match the selected filters.
        </div>
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 gap-4 md:grid-cols-2" : "flex flex-col gap-4"}>
          {visibleOffers.map((offer) => (
            <LiveMarketCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
