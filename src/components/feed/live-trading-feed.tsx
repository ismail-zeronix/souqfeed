"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TickerCard } from "@/components/feed/ticker-card";
import { TickerSkeleton } from "@/components/feed/ticker-skeleton";
import { filterOffers } from "@/modules/offers/filter-offers";
import type {
  OfferFilterCriteria,
  OfferListItem,
} from "@/modules/offers/types";

const MAX_VISIBLE = 30;
const MIN_DELAY_MS = 2500;
const MAX_DELAY_MS = 6000;
const INITIAL_LOAD_MS = 700;
const SIMULATED_BADGES = ["NEW", "LIVE", "PRICE_UPDATED"] as const;

// rgb() components for each badge's arrival glow — matches the card's own
// accent-bar colors (brand primary / live / info tokens from globals.css).
const FLASH_RGB: Record<(typeof SIMULATED_BADGES)[number], string> = {
  NEW: "15, 107, 69",
  LIVE: "22, 163, 74",
  PRICE_UPDATED: "42, 92, 138",
};

function nextDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

export function LiveTradingFeed({
  offers,
  criteria,
}: {
  offers: OfferListItem[];
  criteria: OfferFilterCriteria;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [rawOffers, setRawOffers] = useState<OfferListItem[]>([]);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasRevealedInitial, setHasRevealedInitial] = useState(true);
  const isPausedRef = useRef(false);
  const arrivalCounterRef = useRef(0);

  useEffect(() => {
    isPausedRef.current = isManuallyPaused || isHovered;
  }, [isManuallyPaused, isHovered]);

  // Seeds the feed from the mock offer pool after a short artificial delay —
  // sells a "connecting to the live market" moment instead of popping the
  // whole list in instantly.
  useEffect(() => {
    const seeded = [...offers].sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    );
    const timer = setTimeout(() => {
      setRawOffers(seeded);
      setIsLoading(false);
    }, INITIAL_LOAD_MS);
    return () => clearTimeout(timer);
  }, [offers]);

  // Placeholder for the real OFFER_CREATED/OFFER_UPDATED SSE subscription
  // (docs/architecture.md, Phase 2/8) — no realtime backend exists yet, so
  // this replays the mock pool as "new arrivals" on a jittered interval.
  // Arrivals always draw from the FULL pool (the market doesn't pause for a
  // filter) — filtering only changes what's rendered, below.
  useEffect(() => {
    if (isLoading || offers.length === 0) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        if (!isPausedRef.current) {
          const index = arrivalCounterRef.current % offers.length;
          const base = offers[index];
          const badge =
            SIMULATED_BADGES[
              arrivalCounterRef.current % SIMULATED_BADGES.length
            ];
          arrivalCounterRef.current += 1;

          const arrival: OfferListItem = {
            ...base,
            id: `${base.id}-live-${Date.now()}`,
            postedAt: new Date().toISOString(),
            badge,
          };

          setRawOffers((prev) => [arrival, ...prev].slice(0, MAX_VISIBLE));
          setHasRevealedInitial(false);
        }
        scheduleNext();
      }, nextDelay());
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [isLoading, offers]);

  const displayedOffers = useMemo(
    () => filterOffers(rawOffers, criteria),
    [rawOffers, criteria],
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-wide">
            <span
              className="bg-live size-2 animate-pulse rounded-full"
              aria-hidden
            />
            LIVE TRADING FLOOR
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsManuallyPaused((prev) => !prev)}
          >
            {isManuallyPaused ? (
              <>
                <Play className="mr-1 size-4" aria-hidden />
                Resume
              </>
            ) : (
              <>
                <Pause className="mr-1 size-4" aria-hidden />
                Pause
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <>
            <p className="text-muted-foreground text-xs">
              Connecting to live market…
            </p>
            <TickerSkeleton rows={6} />
          </>
        ) : displayedOffers.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-md border border-dashed p-12 text-center text-sm">
            No offers match the selected filters.
          </div>
        ) : (
          <div
            className="flex flex-col gap-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence initial={false}>
              {displayedOffers.map((offer, index) => {
                const flash = offer.badge ? FLASH_RGB[offer.badge] : null;
                return (
                  <motion.div
                    key={offer.id}
                    layout
                    initial={{ opacity: 0, y: -18, scale: 0.98 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      boxShadow: flash
                        ? [
                            `0 0 0 2px rgba(${flash}, 0.45)`,
                            `0 0 0 0px rgba(${flash}, 0)`,
                          ]
                        : "0 0 0 0px rgba(0,0,0,0)",
                    }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 500,
                        damping: 36,
                        mass: 0.6,
                      },
                      opacity: { duration: 0.2 },
                      boxShadow: { duration: 1.3, ease: "easeOut" },
                      delay: hasRevealedInitial ? index * 0.05 : 0,
                    }}
                    className="rounded-md"
                  >
                    <TickerCard offer={offer} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
