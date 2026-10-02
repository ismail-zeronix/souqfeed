import Link from "next/link";
import { Check, FileText, Package, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/ui/stat-tile";
import { BroadcastRings } from "@/components/home/broadcast-rings";
import type { MarketStats } from "@/modules/offers/types";

export function HomeHero({ stats }: { stats: MarketStats }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#06281C] via-[#0F6B45] to-[#1F9D6B]">
      <BroadcastRings className="top-1/2 right-[-120px] size-[420px] -translate-y-1/2" />

      <div className="relative mx-auto max-w-[1440px] px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#E8B968] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#E8B968]" />
            </span>
            LIVE · DUBAI IT WHOLESALE MARKET
          </div>

          <h1 className="mt-4 text-4xl font-bold text-white lg:text-5xl">
            Stop searching hundreds of WhatsApp messages.
          </h1>
          <p className="mt-2 text-xl font-semibold text-[#E8B968] lg:text-2xl">
            Search the Dubai IT market instead.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/75">
            SouqFeed turns suppliers&apos; WhatsApp stock broadcasts into
            structured, searchable offers. Real-time offers. Verified suppliers.
            Better sourcing.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              className="bg-white text-[#0F6B45] hover:bg-white/90"
              render={<Link href="/feed" />}
            >
              View Live Market
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
              render={<Link href="#how-it-works" />}
            >
              How it works
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-[#E8B968]" aria-hidden />
              Verified suppliers
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-[#E8B968]" aria-hidden />
              Real-time market data
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-[#E8B968]" aria-hidden />
              Live across all 7 emirates
            </span>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-10 -mb-10 grid max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            icon={
              <Users className="text-muted-foreground size-5" aria-hidden />
            }
            value={stats.activeSuppliersToday.toLocaleString()}
            animateFrom={stats.activeSuppliersToday}
            label="Active Suppliers Today"
            trendPercent={stats.activeSuppliersTrendPercent}
            className="shadow-lg shadow-black/10"
          />
          <StatTile
            icon={
              <FileText className="text-muted-foreground size-5" aria-hidden />
            }
            value={stats.offersPostedToday.toLocaleString()}
            animateFrom={stats.offersPostedToday}
            label="Offers Posted Today"
            trendPercent={stats.offersPostedTrendPercent}
            className="shadow-lg shadow-black/10"
          />
          <StatTile
            icon={
              <TrendingUp
                className="text-muted-foreground size-5"
                aria-hidden
              />
            }
            value={stats.priceUpdatesToday.toLocaleString()}
            animateFrom={stats.priceUpdatesToday}
            label="Price Updates"
            trendPercent={stats.priceUpdatesTrendPercent}
            className="shadow-lg shadow-black/10"
          />
          <StatTile
            icon={
              <Package className="text-muted-foreground size-5" aria-hidden />
            }
            value={stats.newProductsToday.toLocaleString()}
            animateFrom={stats.newProductsToday}
            label="New Products"
            trendPercent={stats.newProductsTrendPercent}
            className="shadow-lg shadow-black/10"
          />
        </div>
      </div>
    </section>
  );
}
