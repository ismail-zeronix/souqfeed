import { FileText, Package, TrendingUp, Users } from "lucide-react";
import { StatTile } from "@/components/ui/stat-tile";
import type { MarketStats } from "@/modules/offers/types";

export function HomeStatsStrip({ stats }: { stats: MarketStats }) {
  const tiles = [
    [<Users key="active-suppliers" className="text-primary size-5" aria-hidden />, stats.activeSuppliersToday, "Active Suppliers", stats.activeSuppliersTrendPercent],
    [<FileText key="live-offers" className="text-primary size-5" aria-hidden />, stats.offersPostedToday, "Live Offers", stats.offersPostedTrendPercent],
    [<TrendingUp key="price-updates" className="text-primary size-5" aria-hidden />, stats.priceUpdatesToday, "Price Updates", stats.priceUpdatesTrendPercent],
    [<Package key="new-products" className="text-primary size-5" aria-hidden />, stats.newProductsToday, "New Products", stats.newProductsTrendPercent],
  ] as const;

  return (
    <section className="relative z-10 mx-auto -mt-6 grid w-full max-w-[1392px] grid-cols-2 gap-3 px-6 lg:grid-cols-4">
      {tiles.map(([icon, value, label, trend]) => (
        <StatTile
          key={label}
          icon={icon}
          value={value.toLocaleString()}
          animateFrom={value}
          label={label}
          trendPercent={trend}
          className="border-[#ebe6ff] bg-white shadow-[0_10px_30px_rgba(71,42,170,0.08)]"
        />
      ))}
    </section>
  );
}
