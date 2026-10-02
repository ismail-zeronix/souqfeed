"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function useCountUp(target: number | undefined, durationMs = 1200) {
  // Reduced motion skips the animation entirely — resolved once up front via
  // the lazy initializer, not via a setState call inside the effect below
  // (which would just be a synchronous re-render in disguise).
  const [value, setValue] = useState(() =>
    target !== undefined && prefersReducedMotion() ? target : 0,
  );

  useEffect(() => {
    if (target === undefined || prefersReducedMotion()) return;

    let frameId: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs]);

  return value;
}

export interface StatTileProps {
  /** A rendered icon element (e.g. `<Users className="text-muted-foreground size-5" aria-hidden />`),
   * not a bare component reference — this is a client component (for the
   * count-up animation), and React can't serialize a function prop across
   * the server/client boundary from a server-rendered caller. */
  icon: ReactNode;
  value: string;
  label: string;
  trendPercent?: number;
  className?: string;
  /** Set when `value` is computed from `Date.now()` (e.g. relative time) and may
   * legitimately differ between the server render and client hydration instant. */
  suppressValueHydrationWarning?: boolean;
  /** When set, counts up from 0 to this number on mount instead of showing
   * `value` immediately. `value` should already be this number's formatted
   * string — it's shown once the count finishes. */
  animateFrom?: number;
}

export function StatTile({
  icon,
  value,
  label,
  trendPercent,
  className,
  suppressValueHydrationWarning,
  animateFrom,
}: StatTileProps) {
  const hasTrend = typeof trendPercent === "number";
  const isUp = hasTrend && trendPercent >= 0;
  const animatedValue = useCountUp(animateFrom);
  const displayValue =
    animateFrom !== undefined ? animatedValue.toLocaleString() : value;

  return (
    <div
      className={cn(
        "border-border bg-card flex items-center gap-3 rounded-md border px-4 py-3",
        className,
      )}
    >
      {icon}
      <div className="flex min-w-0 flex-col">
        <div className="flex items-baseline gap-2">
          <span
            className="text-foreground text-lg font-semibold tabular-nums"
            suppressHydrationWarning={
              suppressValueHydrationWarning || animateFrom !== undefined
            }
          >
            {displayValue}
          </span>
          {hasTrend && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium tabular-nums",
                isUp ? "text-live" : "text-destructive",
              )}
            >
              {isUp ? (
                <ArrowUp className="size-3" aria-hidden />
              ) : (
                <ArrowDown className="size-3" aria-hidden />
              )}
              {Math.abs(trendPercent)}%
            </span>
          )}
        </div>
        <span className="text-muted-foreground truncate text-xs">{label}</span>
      </div>
    </div>
  );
}
