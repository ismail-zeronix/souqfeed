"use client";

import type { KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { SupplierLogoTile } from "@/components/ui/supplier-logo-tile";
import {
  MarketBadge,
  type MarketBadgeVariant,
} from "@/components/market/market-badge";
import {
  formatAvailability,
  formatPrice,
  formatRelativeTime,
} from "@/components/market/live-market-card";
import type { OfferListItem } from "@/modules/offers/types";

export function MobileOfferCard({
  offer,
  summary = false,
}: {
  offer: OfferListItem;
  summary?: boolean;
}) {
  const router = useRouter();
  const price = formatPrice(offer);
  const availability = formatAvailability(offer.availabilityStatus);
  const isPriceDown =
    offer.previousPrice !== null &&
    offer.price !== null &&
    offer.previousPrice > offer.price;
  const whatsappHref = `https://wa.me/${offer.whatsappNumber.replace(/\D/g, "")}`;

  function openSupplier() {
    router.push(`/suppliers/${offer.supplierSlug}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openSupplier();
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      role="link"
      tabIndex={0}
      onClick={openSupplier}
      onKeyDown={handleKeyDown}
      className="border-border bg-card hover:border-primary/40 flex cursor-pointer flex-col gap-2 rounded-2xl border p-3 shadow-sm transition-colors"
    >
      <div className="flex items-start gap-2.5">
        <SupplierLogoTile initial={offer.supplierName.charAt(0)} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1 text-sm font-medium">
              <span className="text-foreground truncate">
                {offer.supplierName}
              </span>
              {offer.supplierVerified && (
                <span
                  className="text-primary shrink-0"
                  title="Verified Supplier"
                  aria-label="Verified Supplier"
                >
                  ✓
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {offer.badge && (
                <MarketBadge variant={offer.badge as MarketBadgeVariant} />
              )}
              <span
                className="text-muted-foreground text-[11px]"
                suppressHydrationWarning
              >
                {formatRelativeTime(offer.postedAt)}
              </span>
            </div>
          </div>
          <div className="text-muted-foreground text-xs">
            {offer.locationName}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-foreground truncate text-[15px] font-semibold">
          {offer.title}
        </h3>
        <p className="text-muted-foreground truncate text-xs">
          {offer.specLine.join(" · ")}
        </p>
      </div>

      {!summary && (
        <div className="border-border flex items-end justify-between gap-3 border-t pt-2">
          <div className="text-xs">
            <span className="text-foreground font-semibold tabular-nums">
              {offer.quantity ?? "—"}
              {offer.quantity ? " units" : ""}
            </span>
            <span className={`ml-1 ${availability.colorClass}`}>
              {availability.label}
            </span>
          </div>
          <div className="text-right">
            <div
              className={`text-base font-bold tabular-nums ${isPriceDown ? "text-destructive" : "text-primary"}`}
            >
              {price.primary}
            </div>
            {price.secondary && (
              <div className="text-muted-foreground text-[11px]">
                {price.secondary}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-xs font-medium">
        <Link
          href={`/suppliers/${offer.supplierSlug}`}
          onClick={(event) => event.stopPropagation()}
          className="text-primary inline-flex items-center gap-1"
        >
          View supplier <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="text-primary inline-flex items-center gap-1"
        >
          <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
        </a>
      </div>
    </motion.div>
  );
}
