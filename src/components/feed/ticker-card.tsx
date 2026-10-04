"use client";

import Link from "next/link";
import {
  Bookmark,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    return { currency: offer.currency, visibleDigit: null, maskedDigits: null, plainLabel: "Hidden", srLabel: "Price not disclosed" };
  }
  if (offer.priceType === "UNKNOWN") {
    return { currency: offer.currency, visibleDigit: null, maskedDigits: null, plainLabel: "—", srLabel: "Price unavailable" };
  }
  if (offer.priceType === "ASK" || offer.price === null) {
    return { currency: offer.currency, visibleDigit: null, maskedDigits: null, plainLabel: "ASK", srLabel: "Best price on request" };
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

export interface TickerCardProps {
  offer: OfferListItem;
  className?: string;
}

export function TickerCard({ offer, className }: TickerCardProps) {
  const price = getMaskedPrice(offer);
  const [isSaved, setIsSaved] = useState(false);
  const whatsappHref = `https://wa.me/${offer.whatsappNumber.replace(/\D/g, "")}`;
  const initials = offer.supplierName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article className={cn("border-border bg-card hover:border-primary/30 relative flex min-w-0 flex-col rounded-xl border px-3 py-2.5 shadow-[0_2px_10px_rgba(34,22,80,0.04)] transition-colors lg:flex-row lg:items-center sm:px-3.5", className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center">
        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link href={`/suppliers/${offer.supplierSlug}`} className="truncate text-xs font-semibold text-slate-900 hover:text-primary">
              {offer.supplierName}
            </Link>
            {offer.supplierVerified && <span className="bg-primary text-primary-foreground flex size-3.5 items-center justify-center rounded-full" aria-label="Verified Supplier"><Check className="size-2.5" strokeWidth={3} /></span>}
            <span className="text-muted-foreground flex items-center gap-1 text-[10px]"><MapPin className="size-3" aria-hidden />{offer.locationName}, UAE</span>
            <span className="text-muted-foreground flex items-center gap-1 text-[10px]"><Clock3 className="size-3" aria-hidden />{formatRelativeTime(offer.postedAt)}</span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <Link href={`/suppliers/${offer.supplierSlug}`} className="text-sm font-bold text-slate-900 hover:text-primary sm:text-[15px]">{offer.title}</Link>
            {offer.badge && <MarketBadge variant={offer.badge as MarketBadgeVariant} className="h-5 text-[9px]" />}
          </div>
          <p className="text-muted-foreground mt-0.5 truncate text-[11px]">{offer.specLine.join(" · ")}</p>
        </div>
        <div className="flex shrink-0 items-start gap-1 lg:pt-0.5">
          <Button variant="ghost" size="icon-sm" aria-label={isSaved ? "Remove bookmark" : "Bookmark offer"} onClick={() => setIsSaved((saved) => !saved)} className={isSaved ? "text-primary" : "text-slate-400"}><Bookmark className="size-4" fill={isSaved ? "currentColor" : "none"} aria-hidden /></Button>
          <Button variant="ghost" size="icon-sm" aria-label="More offer actions" className="text-slate-400"><MoreHorizontal className="size-4" aria-hidden /></Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2 lg:mt-0 lg:shrink-0 lg:border-t-0 lg:border-l lg:py-0 lg:pl-4">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-primary text-base font-bold tabular-nums">{offer.quantity ?? "—"}{offer.quantity ? " Units" : ""}</div>
            <div className={`text-[10px] ${offer.availabilityStatus === "AVAILABLE" ? "text-live" : "text-muted-foreground"}`}>{offer.availabilityStatus === "AVAILABLE" ? "In Stock" : "On Request"}</div>
          </div>
          <div>
            <div className="text-primary text-base font-bold tabular-nums">{price.plainLabel ?? `${price.currency} ${price.visibleDigit}${price.maskedDigits}`}</div>
            <div className="text-muted-foreground text-[10px]">{price.plainLabel === "ASK" ? "Good quantity available" : "Per Unit"}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/suppliers/${offer.supplierSlug}`} />}>View Supplier</Button>
          <Button size="sm" nativeButton={false} render={<a href={whatsappHref} target="_blank" rel="noreferrer" />}><MessageCircle className="size-3.5" aria-hidden /> WhatsApp</Button>
        </div>
      </div>
    </article>
  );
}
