import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LiveMarketCard } from "@/components/market/live-market-card";
import type { OfferListItem } from "@/modules/offers/types";

export function LiveMarketSnapshot({ offers }: { offers: OfferListItem[] }) {
  const preview = offers.slice(0, 6);

  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-6 lg:py-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-foreground text-xl font-bold tracking-tight">Latest Supplier Offers</h2>
        </div>
        <Link
          href="/feed"
          className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
        >
          View all offers
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {preview.map((offer) => (
          <LiveMarketCard key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  );
}
