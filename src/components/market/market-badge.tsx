import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type MarketBadgeVariant = "NEW" | "LIVE" | "PRICE_UPDATED";

const VARIANT_CLASSES: Record<MarketBadgeVariant, string> = {
  NEW: "bg-primary text-primary-foreground",
  LIVE: "bg-info text-white",
  PRICE_UPDATED: "bg-info text-white",
};

const VARIANT_LABELS: Record<MarketBadgeVariant, string> = {
  NEW: "NEW",
  LIVE: "LIVE",
  PRICE_UPDATED: "PRICE UPDATED",
};

export function MarketBadge({
  variant,
  className,
}: {
  variant: MarketBadgeVariant;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        VARIANT_CLASSES[variant],
        "rounded px-2 font-semibold tracking-wide",
        className,
      )}
    >
      {VARIANT_LABELS[variant]}
    </Badge>
  );
}
