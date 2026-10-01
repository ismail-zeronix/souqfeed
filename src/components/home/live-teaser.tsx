import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TickerCard } from "@/components/feed/ticker-card";
import type { OfferListItem } from "@/modules/offers/types";

export function LiveTeaser({ offers }: { offers: OfferListItem[] }) {
  const preview = offers.slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
          <span className="bg-live size-2 rounded-full" aria-hidden />
          Live right now
        </h2>
        <Link
          href="/feed"
          className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
        >
          Enter Live Market
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {preview.map((offer) => (
          <TickerCard key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  );
}
