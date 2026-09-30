import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupplierLogoTile } from "@/components/ui/supplier-logo-tile";
import {
  MarketBadge,
  type MarketBadgeVariant,
} from "@/components/market/market-badge";
import type { OfferListItem } from "@/modules/offers/types";

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function formatPrice(offer: OfferListItem): {
  primary: string;
  secondary: string | null;
} {
  if (offer.priceType === "ASK" || offer.price === null) {
    return { primary: "ASK", secondary: "Best price on request" };
  }
  const primary = `${offer.currency} ${offer.price.toLocaleString()}`;
  if (offer.previousPrice !== null && offer.previousPrice > offer.price) {
    return {
      primary,
      secondary: `Was ${offer.previousPrice.toLocaleString()}`,
    };
  }
  if (offer.quantity !== null && offer.quantity >= 100) {
    return { primary, secondary: "Bulk price available" };
  }
  return { primary, secondary: null };
}

export interface LiveMarketCardProps {
  offer: OfferListItem;
  actionLabel?: "View Supplier" | "View Product";
}

export function LiveMarketCard({
  offer,
  actionLabel = "View Supplier",
}: LiveMarketCardProps) {
  const price = formatPrice(offer);
  const isPriceDown =
    offer.previousPrice !== null &&
    offer.price !== null &&
    offer.previousPrice > offer.price;
  const whatsappHref = `https://wa.me/${offer.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <div className="border-border bg-card flex min-w-0 flex-col gap-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        {offer.badge ? (
          <MarketBadge variant={offer.badge as MarketBadgeVariant} />
        ) : (
          <span />
        )}
        <span
          className="text-muted-foreground shrink-0 text-xs"
          suppressHydrationWarning
        >
          {formatRelativeTime(offer.postedAt)}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <SupplierLogoTile initial={offer.supplierName.charAt(0)} size="md" />
        <div className="min-w-0 flex-1">
          <div className="text-foreground flex flex-wrap items-center gap-1 text-sm font-medium">
            <span className="truncate">{offer.supplierName}</span>
            {offer.supplierVerified && (
              <span
                className="text-primary"
                title="Verified Supplier"
                aria-label="Verified Supplier"
              >
                ✓
              </span>
            )}
          </div>
          <div className="text-muted-foreground text-xs">
            {offer.locationName} · {offer.supplierPositiveScorePercent}%
            Positive
          </div>
          <h3 className="text-foreground mt-1 truncate text-base font-semibold">
            {offer.title}
          </h3>
          <p className="text-muted-foreground truncate text-xs">
            {offer.specLine.join(" · ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="border-border text-muted-foreground rounded border px-2 py-0.5 text-[11px]">
              {offer.categoryName}
            </span>
            <span className="border-border text-muted-foreground rounded border px-2 py-0.5 text-[11px]">
              {offer.brandName}
            </span>
          </div>
        </div>
      </div>

      <div className="border-border flex flex-wrap items-end justify-between gap-4 border-t pt-3">
        <div className="flex gap-6 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Quantity</div>
            <div className="text-foreground font-semibold tabular-nums">
              {offer.quantity ?? "—"}
              {offer.quantity ? " units" : ""}
            </div>
            <div className="text-live text-xs">In Stock</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">
              Price ({offer.currency})
            </div>
            <div
              className={`font-semibold tabular-nums ${isPriceDown ? "text-destructive" : "text-foreground"}`}
            >
              {price.primary}
            </div>
            {price.secondary && (
              <div className="text-muted-foreground text-xs">
                {price.secondary}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/suppliers/${offer.supplierSlug}`} />}
          >
            {actionLabel}
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={<a href={whatsappHref} target="_blank" rel="noreferrer" />}
          >
            <MessageCircle className="mr-1 size-4" aria-hidden />
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
