import Link from "next/link";
import { BadgeCheck, MessageCircle } from "lucide-react";
import { FreshnessBadge } from "@/components/offers/offer-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { SearchGroup } from "@/modules/search/queries";

const TIER_LABELS: Record<number, string> = {
  1: "Part number match",
  2: "Model match",
  3: "Alias match",
  7: "Similar spelling",
};

/** One canonical product with every supplier currently offering it. */
export function SearchResultCard({ group }: { group: SearchGroup }) {
  return (
    <article className="bg-card rounded-xl border">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">
            {[group.brandName, group.categoryName].filter(Boolean).join(" · ")}
          </p>
          <h2 className="text-base font-semibold break-words">{group.title}</h2>
          {group.partNumber && (
            <p className="text-muted-foreground font-mono text-xs">
              {group.partNumber}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm font-medium">
            {group.supplierCount}{" "}
            {group.supplierCount === 1 ? "supplier" : "suppliers"}
          </span>
          {TIER_LABELS[group.tier] && (
            <Badge variant="secondary">{TIER_LABELS[group.tier]}</Badge>
          )}
        </div>
      </header>
      <ul className="divide-y">
        {group.offers.map((offer) => (
          <li
            key={offer.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm"
          >
            <div className="min-w-40 flex-1">
              <Link
                href={`/suppliers/${offer.supplierSlug}`}
                className="inline-flex items-center gap-1 font-medium hover:underline"
              >
                {offer.supplierName}
                {offer.supplierVerified && (
                  <BadgeCheck
                    className="text-primary size-4"
                    aria-label="Verified supplier"
                  />
                )}
              </Link>
              {offer.locationName && (
                <p className="text-muted-foreground text-xs">
                  {offer.locationName}
                </p>
              )}
            </div>
            <div className="text-right font-semibold tabular-nums sm:w-28">
              {formatPrice(offer.price, offer.currency, offer.priceType) ?? (
                <span className="text-muted-foreground font-normal">
                  No price
                </span>
              )}
            </div>
            <div className="text-muted-foreground tabular-nums sm:w-20 sm:text-right">
              {offer.quantity !== null ? `${offer.quantity} pcs` : "—"}
            </div>
            <div className="sm:w-28">
              <FreshnessBadge lastVerifiedAt={offer.lastVerifiedAt} />
            </div>
            <Button
              size="sm"
              className="ml-auto sm:ml-0"
              nativeButton={false}
              render={
                <a
                  href={`https://wa.me/${offer.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I saw ${group.title} on SouqFeed. Is it available?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle aria-hidden />
              WhatsApp
            </Button>
          </li>
        ))}
      </ul>
    </article>
  );
}
