import { Flame } from "lucide-react";
import { SidebarWidget } from "@/components/ui/sidebar-widget";
import { SupplierLogoTile } from "@/components/ui/supplier-logo-tile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/modules/categories/types";
import type { SupplierSummary } from "@/modules/suppliers/types";

// placeholder — no backing schema field yet (price-trend intelligence is deferred, per project_plan.md)
const MOCK_PRICE_MOVEMENTS = [
  { categoryId: "cat-laptops", categoryName: "Laptops", changePercent: 24 },
  { categoryId: "cat-storage", categoryName: "Storage", changePercent: 18 },
  { categoryId: "cat-networking", categoryName: "Networking", changePercent: 32 },
  { categoryId: "cat-desktops", categoryName: "Desktops", changePercent: 12 },
  { categoryId: "cat-monitors", categoryName: "Monitors", changePercent: 9 },
];

// placeholder — no backing schema field yet (trending-search tracking is deferred)
const MOCK_TRENDING_SEARCHES = [
  { term: "iPhone 15", searchCount: 248 },
  { term: "RTX 4090", searchCount: 197 },
  { term: "Lenovo ThinkPad", searchCount: 186 },
  { term: "HP 250 G10", searchCount: 162 },
  { term: "WD 8TB", searchCount: 148 },
];

// placeholder — no backing schema field yet (WTB is a deferred feature)
const MOCK_WTB_REQUESTS = [
  { id: "wtb-1", title: "WTB iPhone 15 Pro Max 256GB", location: "Dubai", postedLabel: "5m ago" },
  { id: "wtb-2", title: "WTB RTX 4080 / 4090", location: "Urgent", postedLabel: "12m ago" },
  { id: "wtb-3", title: "WTB Cisco Switches", location: "Dubai", postedLabel: "28m ago" },
  { id: "wtb-4", title: "WTB Dell Laptops (i7)", location: "Corporate", postedLabel: "41m ago" },
];

export function MarketPulseSidebar({
  trendingCategories,
  topSuppliers,
}: {
  trendingCategories: Category[];
  topSuppliers: SupplierSummary[];
}) {
  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4">
      <SidebarWidget title="Market Pulse" liveIndicator>
        <Tabs defaultValue="categories">
          <TabsList className="mb-2 w-full">
            <TabsTrigger value="categories" className="flex-1">
              Trending Categories
            </TabsTrigger>
            <TabsTrigger value="prices" className="flex-1">
              Price Movement
            </TabsTrigger>
          </TabsList>
          <TabsContent value="categories" className="flex flex-col gap-2">
            {trendingCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{category.name}</span>
                <span className="tabular-nums text-muted-foreground">{category.offerCount}</span>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="prices" className="flex flex-col gap-2">
            {MOCK_PRICE_MOVEMENTS.map((movement) => (
              <div key={movement.categoryId} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{movement.categoryName}</span>
                <span className={`tabular-nums ${movement.changePercent >= 0 ? "text-live" : "text-destructive"}`}>
                  {movement.changePercent >= 0 ? "+" : ""}
                  {movement.changePercent}%
                </span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </SidebarWidget>

      <SidebarWidget title="Trending Today" showViewAll>
        {MOCK_TRENDING_SEARCHES.map((entry, index) => (
          <div key={entry.term} className="flex items-center justify-between text-sm">
            <span className="text-foreground">
              <span className="mr-2 text-muted-foreground">{index + 1}</span>
              {entry.term}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="size-3 text-destructive" aria-hidden />
              {entry.searchCount} searches
            </span>
          </div>
        ))}
      </SidebarWidget>

      <SidebarWidget title="Top Active Suppliers" showViewAll>
        {topSuppliers.map((supplier) => (
          <div key={supplier.id} className="flex items-center gap-2 text-sm">
            <SupplierLogoTile initial={supplier.companyName.charAt(0)} size="sm" />
            <div className="min-w-0">
              <div className="truncate font-medium text-foreground">{supplier.companyName}</div>
              <div className="text-xs text-muted-foreground">
                {supplier.activeOfferCount} offers · {supplier.positiveScorePercent}% positive
              </div>
            </div>
          </div>
        ))}
      </SidebarWidget>

      <SidebarWidget title="Latest WTB Requests" showViewAll>
        {MOCK_WTB_REQUESTS.map((request) => (
          <div key={request.id} className="text-sm">
            <div className="text-foreground">{request.title}</div>
            <div className="text-xs text-muted-foreground">
              {request.location} · {request.postedLabel}
            </div>
          </div>
        ))}
      </SidebarWidget>
    </aside>
  );
}
