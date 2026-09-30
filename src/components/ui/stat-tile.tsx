import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatTileProps {
  icon: LucideIcon;
  value: string;
  label: string;
  trendPercent?: number;
  className?: string;
  /** Set when `value` is computed from `Date.now()` (e.g. relative time) and may
   * legitimately differ between the server render and client hydration instant. */
  suppressValueHydrationWarning?: boolean;
}

export function StatTile({
  icon: Icon,
  value,
  label,
  trendPercent,
  className,
  suppressValueHydrationWarning,
}: StatTileProps) {
  const hasTrend = typeof trendPercent === "number";
  const isUp = hasTrend && trendPercent >= 0;

  return (
    <div
      className={cn(
        "border-border bg-card flex items-center gap-3 rounded-md border px-4 py-3",
        className,
      )}
    >
      <Icon className="text-muted-foreground size-5" aria-hidden />
      <div className="flex min-w-0 flex-col">
        <div className="flex items-baseline gap-2">
          <span
            className="text-foreground text-lg font-semibold tabular-nums"
            suppressHydrationWarning={suppressValueHydrationWarning}
          >
            {value}
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
