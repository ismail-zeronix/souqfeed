"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Pause,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";
import { TickerCard } from "@/components/feed/ticker-card";
import { TickerSkeleton } from "@/components/feed/ticker-skeleton";
import { getLiveFeedSummary } from "@/components/feed/live-feed-utils";
import {
  filterOffers,
  sortOffers,
  type SortOption,
} from "@/modules/offers/filter-offers";
import type {
  OfferFilterCriteria,
  OfferListItem,
} from "@/modules/offers/types";
import type { Brand } from "@/modules/brands/types";
import type { Category } from "@/modules/categories/types";

const MAX_VISIBLE = 30;
const MIN_DELAY_MS = 2500;
const MAX_DELAY_MS = 6000;
const INITIAL_LOAD_MS = 700;
const SIMULATED_BADGES = ["NEW", "LIVE", "PRICE_UPDATED"] as const;

const FLASH_RGB: Record<(typeof SIMULATED_BADGES)[number], string> = {
  NEW: "108, 66, 245",
  LIVE: "22, 163, 74",
  PRICE_UPDATED: "42, 92, 138",
};

const FEED_TABS = [
  { label: "All Offers", count: 2847 },
  { label: "New", count: 421 },
  { label: "Price Updated", count: 632 },
  { label: "In Stock", count: 1942 },
  { label: "On Request", count: 386 },
] as const;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Latest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function nextDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function LiveTradingFeed({
  offers,
  criteria,
  brands,
  categories,
  locationNames,
  onCriteriaChange,
  currentPage,
  pageSize,
  pageCount,
  totalOfferCount,
  paginationQuery,
}: {
  offers: OfferListItem[];
  criteria: OfferFilterCriteria;
  brands: Brand[];
  categories: Category[];
  locationNames: string[];
  onCriteriaChange: (criteria: OfferFilterCriteria) => void;
  currentPage: number;
  pageSize: number;
  pageCount: number;
  totalOfferCount: number;
  paginationQuery: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [rawOffers, setRawOffers] = useState<OfferListItem[]>([]);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState("All Offers");
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [sort, setSort] = useState<SortOption>("recent");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isPausedRef = useRef(false);
  const arrivalCounterRef = useRef(0);
  const mascotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isPausedRef.current = isManuallyPaused || isHovered;
  }, [isManuallyPaused, isHovered]);

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
        }
        scheduleNext();
      }, nextDelay());
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [isLoading, offers]);

  useEffect(() => {
    return () => {
      if (mascotTimerRef.current) clearTimeout(mascotTimerRef.current);
    };
  }, []);

  function handleTabChange(label: string) {
    if (label === activeTab) return;
    setActiveTab(label);
    setIsTabTransitioning(true);
    if (mascotTimerRef.current) clearTimeout(mascotTimerRef.current);
    mascotTimerRef.current = setTimeout(() => {
      setIsTabTransitioning(false);
    }, 850);
  }

  const displayedOffers = useMemo(() => {
    const filtered = filterOffers(rawOffers, criteria);
    const tabFiltered =
      activeTab === "In Stock"
        ? filtered.filter((offer) => offer.availabilityStatus === "AVAILABLE")
        : activeTab === "On Request"
          ? filtered.filter((offer) => offer.priceType === "ASK")
          : activeTab === "New"
            ? filtered.filter((offer) => offer.badge === "NEW")
            : activeTab === "Price Updated"
              ? filtered.filter((offer) => offer.badge === "PRICE_UPDATED")
              : filtered;
    return sortOffers(tabFiltered, sort);
  }, [rawOffers, criteria, activeTab, sort]);
  const liveSummary = getLiveFeedSummary(offers);
  const activeFilterCount =
    criteria.brandIds.length +
    criteria.categoryIds.length +
    criteria.locationNames.length +
    (criteria.inStockOnly ? 1 : 0);

  function clearFilters() {
    onCriteriaChange({
      ...criteria,
      brandIds: [],
      categoryIds: [],
      locationNames: [],
      inStockOnly: false,
    });
  }

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > pageCount || nextPage === currentPage)
      return;
    const params = new URLSearchParams(paginationQuery);
    if (nextPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    const query = params.toString();
    router.push(query ? `/feed?${query}` : "/feed");
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative flex min-w-0 flex-1 flex-col gap-3"
        aria-label={`Live feed showing ${liveSummary.offerCount} loaded offers from ${liveSummary.supplierCount} suppliers`}
      >
        <div className="sticky top-14 z-20 -mx-1 flex flex-col gap-2 bg-[#f7f8fc]/95 px-1 py-1.5 backdrop-blur-md">
          <div className="relative flex items-center gap-2">
            <div className="flex min-w-0 [scrollbar-width:none] items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
              {FEED_TABS.map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => handleTabChange(tab.label)}
                  className={
                    activeTab === tab.label
                      ? "bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap shadow-sm"
                      : "bg-card hover:text-primary rounded-full border border-slate-200 px-4 py-2 text-xs font-medium whitespace-nowrap text-slate-600 transition-colors"
                  }
                >
                  {tab.label}{" "}
                  <span className="opacity-70">
                    ({tab.count.toLocaleString()})
                  </span>
                </button>
              ))}
            </div>
            <Button
              variant={
                isFilterOpen || activeFilterCount > 0 ? "default" : "outline"
              }
              size="sm"
              className="shrink-0 rounded-full"
              onClick={() => setIsFilterOpen((open) => !open)}
              aria-expanded={isFilterOpen}
            >
              <SlidersHorizontal className="size-3.5" aria-hidden />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 text-[10px]">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`size-3.5 transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </Button>

            {isFilterOpen && (
              <div className="border-border bg-card absolute top-11 right-0 z-30 w-[min(390px,calc(100vw-2rem))] rounded-2xl border p-4 shadow-[0_14px_40px_rgba(40,16,95,0.16)]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-950">
                      Filter offers
                    </h2>
                    <p className="text-muted-foreground mt-0.5 text-[10px]">
                      Refine the live market without leaving the feed.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="text-muted-foreground hover:text-foreground rounded-full p-1"
                    aria-label="Close filters"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="grid max-h-[min(62vh,390px)] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-[11px] font-bold text-slate-900">
                      Category
                    </legend>
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center justify-between gap-2 text-xs text-slate-700"
                      >
                        <span className="flex items-center gap-2">
                          <Checkbox
                            checked={criteria.categoryIds.includes(category.id)}
                            onCheckedChange={() =>
                              onCriteriaChange({
                                ...criteria,
                                categoryIds: toggleValue(
                                  criteria.categoryIds,
                                  category.id,
                                ),
                              })
                            }
                          />
                          {category.name}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {category.offerCount}
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-[11px] font-bold text-slate-900">
                      Brand
                    </legend>
                    {brands.map((brand) => (
                      <label
                        key={brand.id}
                        className="flex items-center gap-2 text-xs text-slate-700"
                      >
                        <Checkbox
                          checked={criteria.brandIds.includes(brand.id)}
                          onCheckedChange={() =>
                            onCriteriaChange({
                              ...criteria,
                              brandIds: toggleValue(
                                criteria.brandIds,
                                brand.id,
                              ),
                            })
                          }
                        />
                        {brand.name}
                      </label>
                    ))}
                  </fieldset>
                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-[11px] font-bold text-slate-900">
                      Location (UAE)
                    </legend>
                    {locationNames.map((location) => (
                      <label
                        key={location}
                        className="flex items-center gap-2 text-xs text-slate-700"
                      >
                        <Checkbox
                          checked={criteria.locationNames.includes(location)}
                          onCheckedChange={() =>
                            onCriteriaChange({
                              ...criteria,
                              locationNames: toggleValue(
                                criteria.locationNames,
                                location,
                              ),
                            })
                          }
                        />
                        {location}
                      </label>
                    ))}
                  </fieldset>
                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-[11px] font-bold text-slate-900">
                      Availability
                    </legend>
                    <label className="flex items-center gap-2 text-xs text-slate-700">
                      <Checkbox
                        checked={criteria.inStockOnly}
                        onCheckedChange={(checked) =>
                          onCriteriaChange({
                            ...criteria,
                            inStockOnly: checked === true,
                          })
                        }
                      />
                      In stock only
                    </label>
                  </fieldset>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-primary text-xs font-medium hover:underline"
                  >
                    Clear all
                  </button>
                  <Button
                    size="sm"
                    className="rounded-full px-4"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Show offers
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="bg-live size-1.5 rounded-full" aria-hidden />
              Updating live
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground ml-1"
                onClick={() => setIsManuallyPaused((prev) => !prev)}
              >
                {isManuallyPaused ? (
                  <>
                    <Play className="size-3" aria-hidden /> Resume
                  </>
                ) : (
                  <>
                    <Pause className="size-3" aria-hidden /> Pause
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="border-border bg-card flex h-8 items-center gap-1 rounded-lg border px-1">
                <ArrowDownUp
                  className="text-muted-foreground ml-1 size-3.5"
                  aria-hidden
                />
                <select
                  aria-label="Sort offers"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  className="bg-transparent px-1 text-xs font-medium text-slate-700 outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isTabTransitioning && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute top-12 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-violet-100 bg-white/95 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-lg backdrop-blur"
              role="status"
              aria-live="polite"
            >
              <SouqFeedAgent state="searching" size="sm" className="-my-1" />
              Updating the live feed…
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <SouqFeedAgent state="loading" size="sm" />
              Connecting to live market…
            </div>
            <TickerSkeleton rows={6} />
          </>
        ) : displayedOffers.length === 0 ? (
          <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed bg-white p-8 text-center text-sm sm:p-12">
            <SouqFeedAgent state="thinking" size="md" />
            No offers match the selected filters.
          </div>
        ) : (
          <div
            className="flex flex-col gap-3"
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
                      delay: index * 0.03,
                    }}
                    className="rounded-xl"
                  >
                    <TickerCard offer={offer} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <div className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2.5 shadow-[0_2px_10px_rgba(34,22,80,0.03)]">
          <span className="text-muted-foreground text-xs">
            Showing{" "}
            {totalOfferCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, totalOfferCount)} of{" "}
            {totalOfferCount} offers
          </span>
          <nav
            className="flex items-center gap-1"
            aria-label="Live feed pagination"
          >
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() => goToPage(pageNumber)}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                  aria-label={`Page ${pageNumber}`}
                >
                  {pageNumber}
                </Button>
              ),
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={currentPage === pageCount}
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </nav>
        </div>
      </div>
    </MotionConfig>
  );
}
