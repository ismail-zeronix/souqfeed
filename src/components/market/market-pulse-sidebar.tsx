import Link from "next/link";
import { ArrowUpRight, ChevronDown, Search } from "lucide-react";
import { SidebarWidget } from "@/components/ui/sidebar-widget";
import { SupplierLogoTile } from "@/components/ui/supplier-logo-tile";
import { ZeronixAdBanner } from "@/components/market/zeronix-ad-banner";
import type { Category } from "@/modules/categories/types";
import type { CategoryPriceMovement, TrendingSearchTerm, WtbRequestSnippet } from "@/modules/offers/types";
import type { SupplierSummary } from "@/modules/suppliers/types";

const PULSE_BARS = [28, 42, 24, 54, 38, 68, 46, 78, 42, 62, 84, 50, 74, 58, 91, 66];

export function MarketPulseSidebar({
  trendingCategories,
  priceMovements,
  trendingSearches,
  topSuppliers,
  wtbRequests,
}: {
  trendingCategories: Category[];
  priceMovements: CategoryPriceMovement[];
  trendingSearches: TrendingSearchTerm[];
  topSuppliers: SupplierSummary[];
  wtbRequests: WtbRequestSnippet[];
}) {
  const pulseValues = [
    { value: "2,847", label: "Live Offers", trend: "↑ 12%" },
    { value: "186", label: "Active Suppliers", trend: "↑ 8%" },
    { value: "421", label: "WTB Requests", trend: "↑ 15%" },
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-[4.5rem] lg:w-[294px] lg:self-start">
      <SidebarWidget title="Market Pulse" className="rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Live activity</span>
          <button type="button" className="text-primary flex items-center gap-1 text-[10px]">Last 7 days <ChevronDown className="size-3" /></button>
        </div>
        <div className="flex h-20 items-end gap-1 border-b border-slate-100 px-1 pb-2 pt-3">
          {PULSE_BARS.map((height, index) => <span key={`${height}-${index}`} className="bg-primary/35 hover:bg-primary w-full rounded-t-sm transition-colors" style={{ height: `${height}%` }} />)}
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100 pt-3">
          {pulseValues.map((item) => <div key={item.label} className="px-2 first:pl-0 last:pr-0"><div className="text-lg font-bold text-slate-950">{item.value}</div><div className="text-[9px] text-slate-500">{item.label}</div><div className="text-live mt-1 text-[10px] font-semibold">{item.trend}</div></div>)}
        </div>
      </SidebarWidget>

      <SidebarWidget title="Trending Searches" showViewAll className="rounded-xl">
        <div className="flex flex-col divide-y divide-slate-100">
          {trendingSearches.map((entry, index) => <div key={entry.term} className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"><span className="flex min-w-0 items-center gap-2 text-xs"><span className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">{index + 1}</span><span className="truncate text-slate-700">{entry.term}</span></span><span className="text-live flex shrink-0 items-center gap-0.5 text-[10px] font-semibold"><ArrowUpRight className="size-3" />{Math.max(8, 32 - index * 5)}%</span></div>)}
        </div>
      </SidebarWidget>

      <SidebarWidget title="Latest WTB Requests" showViewAll className="rounded-xl">
        <div className="flex flex-col divide-y divide-slate-100">
          {wtbRequests.map((request, index) => <div key={request.id} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0"><SupplierLogoTile initial={request.title.replace("WTB ", "").charAt(0)} size="sm" className={index % 2 === 0 ? "bg-violet-100" : "bg-emerald-100 text-emerald-700"} /><div className="min-w-0 flex-1"><div className="truncate text-xs font-medium text-slate-800">{request.title.replace("WTB ", "")}</div><div className="text-[10px] text-slate-500">{request.location} · {request.postedLabel}</div></div><Link href="/feed" className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-[10px] font-semibold">View</Link></div>)}
        </div>
      </SidebarWidget>

      <div className="from-primary/10 to-accent/70 rounded-xl bg-gradient-to-br p-4">
        <div className="bg-primary/15 text-primary mb-3 flex size-9 items-center justify-center rounded-full"><Search className="size-4" /></div>
        <h3 className="text-sm font-bold text-slate-950">Need help finding stock?</h3>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">Ask SouqFeed AI to search across thousands of live offers from verified suppliers.</p>
        <Link href="/feed" className="bg-primary text-primary-foreground mt-3 flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold">Ask SouqFeed <ArrowUpRight className="size-3.5" /></Link>
      </div>

      <ZeronixAdBanner />

      <span className="sr-only">{trendingCategories.length + priceMovements.length + topSuppliers.length} market insights loaded</span>
    </aside>
  );
}
