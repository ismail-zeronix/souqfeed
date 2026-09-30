import { Calendar, Clock, Layers, ThumbsUp, Users, Zap } from "lucide-react";
import { StatTile } from "@/components/ui/stat-tile";
import type { SupplierProfile } from "@/modules/suppliers/types";

function formatRelativeTime(iso: string): string {
  const hours = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000));
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export function SupplierStatRow({ supplier }: { supplier: SupplierProfile }) {
  const yearsActive = new Date().getFullYear() - supplier.memberSinceYear;

  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-3 px-6 py-4 sm:grid-cols-3 lg:grid-cols-6">
      <StatTile icon={Users} value={String(supplier.activeOfferCount)} label="Active Offers" />
      <StatTile icon={Clock} value={formatRelativeTime(supplier.lastBroadcastAt)} label="Last Broadcast" />
      <StatTile icon={ThumbsUp} value={`${supplier.positiveScorePercent}%`} label="Positive Score" />
      <StatTile icon={Layers} value={String(supplier.categoryMix.length)} label="Product Categories" />
      <StatTile icon={Zap} value={supplier.avgResponseTimeLabel} label="Avg Response Speed" />
      <StatTile icon={Calendar} value={`${yearsActive}+ years`} label="Active on SouqFeed" />
    </div>
  );
}
