import type { ReactNode } from "react";
import {
  IconDatabase,
  IconDeviceLaptop,
  IconRouter,
  IconServer,
} from "@tabler/icons-react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OfferListItem } from "@/modules/offers/types";

/** "AED 2,450", or "Ask" when the supplier gave no price. */
export function offerPriceLabel(offer: OfferListItem) {
  if (offer.price === null) return "Ask";
  return `${offer.currency} ${offer.price.toLocaleString("en-US")}`;
}

/** Concentric rings behind the hero art, anchored to a point on the card. */
export function HeroRings({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute aspect-square", className)}
      aria-hidden
    >
      {[100, 76, 52].map((size) => (
        <div
          key={size}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/20"
          style={{ width: `${size}%`, height: `${size}%` }}
        />
      ))}
    </div>
  );
}

const CHIP_ICONS = [IconDeviceLaptop, IconServer, IconDatabase, IconRouter];

/** A small white tile with an IT icon that floats beside the phone. */
export function FloatingChip({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  const Icon = CHIP_ICONS[index % CHIP_ICONS.length];
  return (
    <div
      className={cn(
        "signal-float absolute flex items-center justify-center rounded-2xl bg-white shadow-[0_12px_28px_rgba(71,42,170,0.18)]",
        className,
      )}
      style={{ animationDelay: `${index * 600}ms` }}
      aria-hidden
    >
      <Icon className="text-primary size-1/2" />
    </div>
  );
}

/**
 * A drawn phone showing the live feed. It reads the same offers the page
 * lists below it, so while the market is empty it shows the sample listings
 * (and the page says so), never made-up ones.
 */
export function PhoneFeed({
  offers,
  className,
}: {
  offers: OfferListItem[];
  className?: string;
}) {
  const rows = offers.slice(0, 4);
  return (
    <div
      className={cn(
        "relative rounded-[2.4rem] border-[7px] border-[#1d1540] bg-white shadow-[0_30px_60px_rgba(45,22,120,0.35)]",
        className,
      )}
      aria-hidden
    >
      <div className="mx-auto mt-2 h-3.5 w-16 rounded-full bg-[#1d1540]" />
      <div className="px-3 pt-3">
        <div className="flex items-center gap-1.5 rounded-xl bg-[#f3f0ff] px-2.5 py-2 text-[10px] whitespace-nowrap text-[#8b83a8]">
          <Search className="size-3 shrink-0" />
          Search model or SKU
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#21184e]">
            Live offers
          </span>
          <span className="text-live flex items-center gap-1 text-[9px] font-semibold">
            <span className="bg-live size-1.5 rounded-full" />
            Live
          </span>
        </div>
        <ul className="mt-2 space-y-2">
          {rows.map((offer) => (
            <li
              key={offer.id}
              className="rounded-xl border border-[#eee9ff] bg-white p-2 shadow-[0_3px_10px_rgba(71,42,170,0.06)]"
            >
              <p className="truncate text-[10.5px] leading-tight font-semibold text-[#21184e]">
                {offer.title}
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-[9px] text-[#8b83a8]">
                  {offer.supplierName}
                </span>
                <span className="text-primary shrink-0 text-[10.5px] font-bold">
                  {offerPriceLabel(offer)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** A frosted card, used for the small info blocks around the hero. */
export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/80 bg-white/70 shadow-[0_10px_30px_rgba(71,42,170,0.12)] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
