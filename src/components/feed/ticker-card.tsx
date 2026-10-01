import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/components/market/live-market-card";
import {
  MarketBadge,
  type MarketBadgeVariant,
} from "@/components/market/market-badge";
import type { OfferListItem } from "@/modules/offers/types";

export interface MaskedPrice {
  currency: string;
  visibleDigit: string | null;
  maskedDigits: string | null;
  plainLabel: string | null;
  srLabel: string;
}

export function getMaskedPrice(offer: OfferListItem): MaskedPrice {
  if (offer.priceType === "HIDDEN") {
    return {
      currency: offer.currency,
      visibleDigit: null,
      maskedDigits: null,
      plainLabel: "Hidden",
      srLabel: "Price not disclosed",
    };
  }
  if (offer.priceType === "UNKNOWN") {
    return {
      currency: offer.currency,
      visibleDigit: null,
      maskedDigits: null,
      plainLabel: "—",
      srLabel: "Price unavailable",
    };
  }
  if (offer.priceType === "ASK" || offer.price === null) {
    return {
      currency: offer.currency,
      visibleDigit: null,
      maskedDigits: null,
      plainLabel: "ASK",
      srLabel: "Best price on request",
    };
  }

  const formatted = offer.price.toLocaleString();
  return {
    currency: offer.currency,
    visibleDigit: formatted.slice(0, 1),
    maskedDigits: formatted.slice(1) || "••",
    plainLabel: null,
    srLabel: "Exact price hidden — sign in to view",
  };
}

// Ticker-tape accent: a thin colored edge so the badge's meaning reads even
// at a glance, before the text registers — green for a fresh/live print,
// blue for a price change, transparent otherwise.
const ACCENT_CLASSES: Record<NonNullable<OfferListItem["badge"]>, string> = {
  NEW: "before:bg-primary",
  LIVE: "before:bg-live",
  PRICE_UPDATED: "before:bg-info",
};

export interface TickerCardProps {
  offer: OfferListItem;
  className?: string;
}

export function TickerCard({ offer, className }: TickerCardProps) {
  const price = getMaskedPrice(offer);

  return (
    <Link
      href={`/suppliers/${offer.supplierSlug}`}
      className={cn(
        "border-border bg-card hover:bg-primary/5 relative flex min-w-0 flex-col gap-1 rounded-md border py-2.5 pr-4 pl-5 transition-colors",
        "before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-md before:content-['']",
        offer.badge ? ACCENT_CLASSES[offer.badge] : "before:bg-transparent",
        className,
      )}
    >
      <div className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs">
        {offer.badge && (
          <MarketBadge
            variant={offer.badge as MarketBadgeVariant}
            className="h-4 px-1.5 py-0 text-[10px]"
          />
        )}
        <span className="truncate">{offer.supplierName}</span>
        {offer.supplierVerified && (
          <span
            className="text-primary shrink-0"
            title="Verified Supplier"
            aria-label="Verified Supplier"
          >
            ✓
          </span>
        )}
        <span aria-hidden>·</span>
        <span className="shrink-0">{offer.locationName}</span>
        <span aria-hidden>·</span>
        <span className="shrink-0" suppressHydrationWarning>
          {formatRelativeTime(offer.postedAt)}
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0 truncate text-sm">
          <span className="text-foreground font-semibold">{offer.title}</span>
          <span className="text-muted-foreground">
            {" "}
            — {offer.specLine.join(" · ")}
          </span>
        </div>

        <div className="flex shrink-0 items-baseline gap-2">
          <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
            <span className="sr-only">{price.srLabel}</span>
            {price.plainLabel ? (
              <span aria-hidden className="text-foreground">
                {price.plainLabel}
              </span>
            ) : (
              <>
                <span aria-hidden className="text-foreground">
                  {price.currency} {price.visibleDigit}
                </span>
                <span
                  aria-hidden
                  className="text-muted-foreground blur-[3px] select-none"
                >
                  {price.maskedDigits}
                </span>
                <Lock aria-hidden className="text-muted-foreground size-3" />
              </>
            )}
          </span>
          {offer.quantity !== null && (
            <span className="text-muted-foreground text-xs tabular-nums">
              · {offer.quantity} units
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
