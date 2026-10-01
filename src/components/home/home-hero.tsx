import Link from "next/link";
import { FileText, Package, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/ui/stat-tile";
import { ArabesquePattern } from "@/components/home/arabesque-pattern";
import { LiveNetworkGlobe } from "@/components/home/live-network-globe";
import type { MarketStats } from "@/modules/offers/types";

export function HomeHero({ stats }: { stats: MarketStats }) {
  return (
    <section className="border-border bg-primary/5 relative overflow-hidden border-b">
      <ArabesquePattern className="text-primary pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" />
      <div className="relative mx-auto grid max-w-[1440px] gap-8 px-6 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Dubai IT Wholesale Market
          </p>
          <h1 className="text-foreground mt-2 text-4xl font-bold">
            Stop searching hundreds of WhatsApp messages.
          </h1>
          <p className="text-primary mt-1 text-2xl font-semibold">
            Search the Dubai IT market instead.
          </p>
          <p className="text-muted-foreground mt-4 max-w-xl text-base">
            SouqFeed turns suppliers&apos; WhatsApp stock broadcasts into
            structured, searchable offers. Real-time offers. Verified suppliers.
            Better sourcing.
          </p>

          <div className="mt-6">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/feed" />}
            >
              View Live Market
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              icon={Users}
              value={stats.activeSuppliersToday.toLocaleString()}
              label="Active Suppliers Today"
              trendPercent={stats.activeSuppliersTrendPercent}
            />
            <StatTile
              icon={FileText}
              value={stats.offersPostedToday.toLocaleString()}
              label="Offers Posted Today"
              trendPercent={stats.offersPostedTrendPercent}
            />
            <StatTile
              icon={TrendingUp}
              value={stats.priceUpdatesToday.toLocaleString()}
              label="Price Updates"
              trendPercent={stats.priceUpdatesTrendPercent}
            />
            <StatTile
              icon={Package}
              value={stats.newProductsToday.toLocaleString()}
              label="New Products"
              trendPercent={stats.newProductsTrendPercent}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <LiveNetworkGlobe />
          <p className="text-muted-foreground text-center text-xs">
            <span className="text-foreground font-semibold tabular-nums">
              {stats.activeSuppliersToday.toLocaleString()}
            </span>{" "}
            suppliers active across Dubai right now
          </p>
        </div>
      </div>
    </section>
  );
}
