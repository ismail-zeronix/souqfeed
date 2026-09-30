import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatTileProps {
  icon: LucideIcon;
  value: string;
  label: string;
  trendPercent?: number;
  className?: string;
}

export function StatTile({ icon: Icon, value, label, trendPercent, className }: StatTileProps) {
  const hasTrend = typeof trendPercent === "number";
  const isUp = hasTrend && trendPercent >= 0;

  return (
    <div className={cn("flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3", className)}>
      <Icon className="size-5 text-muted-foreground" aria-hidden />
      <div className="flex min-w-0 flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tabular-nums text-foreground">{value}</span>
          {hasTrend && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium tabular-nums",
                isUp ? "text-live" : "text-destructive",
              )}
            >
              {isUp ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />}
              {Math.abs(trendPercent)}%
            </span>
          )}
        </div>
        <span className="truncate text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
