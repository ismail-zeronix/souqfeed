import { LiveNetworkGlobe } from "@/components/home/live-network-globe";
import { PriceMovementChart } from "@/components/home/price-movement-chart";
import type {
  CategoryPriceMovement,
  MarketStats,
} from "@/modules/offers/types";

export function MarketIntelligence({
  priceMovements,
  stats,
}: {
  priceMovements: CategoryPriceMovement[];
  stats: MarketStats;
}) {
  return (
    <section className="bg-gradient-to-br from-[#06281C] to-[#0F6B45]">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-14 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
          <h2 className="text-xs font-semibold tracking-widest text-white/60 uppercase">
            Live Network
          </h2>
          <p className="max-w-sm text-sm text-white/70">
            Broadcasts land and get mapped across the UAE as they come in.
          </p>
          <LiveNetworkGlobe />
          <p className="text-xs text-white/60">
            <span className="font-semibold text-white tabular-nums">
              {stats.activeSuppliersToday.toLocaleString()}
            </span>{" "}
            suppliers active right now
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-widest text-white/60 uppercase">
            Price Movement
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Which categories are trending up right now.
          </p>
          <div className="mt-6">
            <PriceMovementChart movements={priceMovements} />
          </div>
        </div>
      </div>
    </section>
  );
}
