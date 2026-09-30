"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { LiveMarketCard } from "@/components/market/live-market-card";
import {
  EMPTY_OFFER_FILTERS,
  filterOffers,
  sortOffers,
} from "@/modules/offers/filter-offers";
import type { OfferListItem } from "@/modules/offers/types";

export function SupplierOffersSection({
  supplierName,
  offers,
}: {
  supplierName: string;
  offers: OfferListItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const visibleOffers = useMemo(
    () =>
      sortOffers(
        filterOffers(offers, { ...EMPTY_OFFER_FILTERS, searchQuery }),
        "recent",
      ),
    [offers, searchQuery],
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={`Search in ${supplierName}'s stock...`}
          className="h-10 pl-9"
        />
      </div>

      <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
        <span className="bg-live size-2 rounded-full" aria-hidden />
        Live Offers from {supplierName}
      </h2>

      {visibleOffers.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-md border border-dashed p-12 text-center text-sm">
          No offers match your search.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleOffers.map((offer) => (
            <LiveMarketCard
              key={offer.id}
              offer={offer}
              actionLabel="View Product"
            />
          ))}
        </div>
      )}
    </div>
  );
}
