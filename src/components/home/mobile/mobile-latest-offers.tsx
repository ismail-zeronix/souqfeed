import Link from "next/link";
import { MobileOfferCard } from "@/components/home/mobile/mobile-offer-card";
import { MobileEmptyState } from "@/components/home/mobile/mobile-empty-state";
import type { OfferListItem } from "@/modules/offers/types";

const PREVIEW_COUNT = 6;

export function MobileLatestOffers({ offers }: { offers: OfferListItem[] }) {
  const preview = offers.slice(0, PREVIEW_COUNT);

  return (
    <section className="px-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Latest Supplier Offers
        </h2>
        <Link href="/feed" className="text-primary text-xs font-medium">
          See All
        </Link>
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {preview.length > 0 ? (
          preview.map((offer) => (
            <MobileOfferCard key={offer.id} offer={offer} summary />
          ))
        ) : (
          <MobileEmptyState />
        )}
      </div>
    </section>
  );
}
