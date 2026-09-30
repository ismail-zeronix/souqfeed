import { Flame } from "lucide-react";
import { SidebarWidget } from "@/components/ui/sidebar-widget";
import { SupplierLogoTile } from "@/components/ui/supplier-logo-tile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/modules/categories/types";
import type {
  CategoryPriceMovement,
  TrendingSearchTerm,
  WtbRequestSnippet,
} from "@/modules/offers/types";
import type { SupplierSummary } from "@/modules/suppliers/types";

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
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-80">
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
              <div
                key={category.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">{category.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {category.offerCount}
                </span>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="prices" className="flex flex-col gap-2">
            {priceMovements.map((movement) => (
              <div
                key={movement.categoryId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">{movement.categoryName}</span>
                <span
                  className={`tabular-nums ${movement.changePercent >= 0 ? "text-live" : "text-destructive"}`}
                >
                  {movement.changePercent >= 0 ? "+" : ""}
                  {movement.changePercent}%
                </span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </SidebarWidget>

      <SidebarWidget title="Trending Today" showViewAll>
        {trendingSearches.map((entry, index) => (
          <div
            key={entry.term}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-foreground">
              <span className="text-muted-foreground mr-2">{index + 1}</span>
              {entry.term}
            </span>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Flame className="text-destructive size-3" aria-hidden />
              {entry.searchCount} searches
            </span>
          </div>
        ))}
      </SidebarWidget>

      <SidebarWidget title="Top Active Suppliers" showViewAll>
        {topSuppliers.map((supplier) => (
          <div key={supplier.id} className="flex items-center gap-2 text-sm">
            <SupplierLogoTile
              initial={supplier.companyName.charAt(0)}
              size="sm"
            />
            <div className="min-w-0">
              <div className="text-foreground truncate font-medium">
                {supplier.companyName}
              </div>
              <div className="text-muted-foreground text-xs">
                {supplier.activeOfferCount} offers ·{" "}
                {supplier.positiveScorePercent}% positive
              </div>
            </div>
          </div>
        ))}
      </SidebarWidget>

      <SidebarWidget title="Latest WTB Requests" showViewAll>
        {wtbRequests.map((request) => (
          <div key={request.id} className="text-sm">
            <div className="text-foreground">{request.title}</div>
            <div className="text-muted-foreground text-xs">
              {request.location} · {request.postedLabel}
            </div>
          </div>
        ))}
      </SidebarWidget>
    </aside>
  );
}
