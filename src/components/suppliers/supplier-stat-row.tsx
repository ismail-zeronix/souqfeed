import { Calendar, Clock, ThumbsUp, Users, Zap } from "lucide-react";
import {
  formatPositiveScore,
  formatTenure,
} from "@/components/suppliers/supplier-metrics";
import { StatTile } from "@/components/ui/stat-tile";
import type { SupplierProfile } from "@/modules/suppliers/types";

function formatRelativeTime(iso: string): string {
  const hours = Math.max(
    1,
    Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000),
  );
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export function SupplierStatRow({ supplier }: { supplier: SupplierProfile }) {
  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-4 sm:gap-3 sm:px-6 sm:py-4">
      <StatTile
        icon={<Users className="text-muted-foreground size-5" aria-hidden />}
        value={String(supplier.activeOfferCount)}
        label="Active Offers"
      />
      <StatTile
        icon={<Clock className="text-muted-foreground size-5" aria-hidden />}
        value={
          supplier.lastBroadcastAt
            ? formatRelativeTime(supplier.lastBroadcastAt)
            : "—"
        }
        label="Last Broadcast"
        suppressValueHydrationWarning
      />
      <StatTile
        icon={<ThumbsUp className="text-muted-foreground size-5" aria-hidden />}
        value={formatPositiveScore(supplier.positiveScorePercent)}
        label="Positive Score"
      />
      <StatTile
        icon={<Zap className="text-muted-foreground size-5" aria-hidden />}
        value={supplier.avgResponseTimeLabel}
        label="Avg Response Speed"
      />
      <StatTile
        icon={<Calendar className="text-muted-foreground size-5" aria-hidden />}
        value={formatTenure(supplier.memberSinceYear, new Date().getFullYear())}
        label="Active on SouqFeed"
      />
    </div>
  );
}
