import { FileText, Package, TrendingUp, Users } from "lucide-react";
import { StatTile } from "@/components/ui/stat-tile";
import type { MarketStats } from "@/modules/offers/types";

export function MarketSnapshotCard({ stats }: { stats: MarketStats }) {
  return (
    <section className="px-4 pt-5">
      <div className="grid grid-cols-2 gap-2.5">
        <StatTile
          icon={<Users className="text-muted-foreground size-5" aria-hidden />}
          value={stats.activeSuppliersToday.toLocaleString()}
          animateFrom={stats.activeSuppliersToday}
          label="Active Suppliers Today"
          trendPercent={stats.activeSuppliersTrendPercent}
        />
        <StatTile
          icon={
            <FileText className="text-muted-foreground size-5" aria-hidden />
          }
          value={stats.offersPostedToday.toLocaleString()}
          animateFrom={stats.offersPostedToday}
          label="Offers Posted Today"
          trendPercent={stats.offersPostedTrendPercent}
        />
        <StatTile
          icon={
            <TrendingUp className="text-muted-foreground size-5" aria-hidden />
          }
          value={stats.priceUpdatesToday.toLocaleString()}
          animateFrom={stats.priceUpdatesToday}
          label="Price Updates"
          trendPercent={stats.priceUpdatesTrendPercent}
        />
        <StatTile
          icon={
            <Package className="text-muted-foreground size-5" aria-hidden />
          }
          value={stats.newProductsToday.toLocaleString()}
          animateFrom={stats.newProductsToday}
          label="New Products"
          trendPercent={stats.newProductsTrendPercent}
        />
      </div>
    </section>
  );
}
