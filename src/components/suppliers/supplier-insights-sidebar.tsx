import { BadgeCheck, Calendar, ThumbsUp, Zap } from "lucide-react";
import { SidebarWidget } from "@/components/ui/sidebar-widget";
import { CategoryMixDonut } from "@/components/suppliers/category-mix-donut";
import { BroadcastActivityBars } from "@/components/suppliers/broadcast-activity-bars";
import type { SupplierProfile } from "@/modules/suppliers/types";

export function SupplierInsightsSidebar({ supplier }: { supplier: SupplierProfile }) {
  const yearsActive = new Date().getFullYear() - supplier.memberSinceYear;

  return (
    <div className="flex flex-col gap-4">
      <SidebarWidget title="Top Brands Supplied" showViewAll>
        {supplier.topBrands.map((brand) => (
          <div key={brand.brandId} className="flex items-center justify-between text-sm">
            <span className="text-foreground">{brand.brandName}</span>
            <span className="tabular-nums text-muted-foreground">{brand.sharePercent}%</span>
          </div>
        ))}
      </SidebarWidget>

      <SidebarWidget title="Category Mix">
        <CategoryMixDonut slices={supplier.categoryMix} totalLabel={`${supplier.activeOfferCount} Active Offers`} />
      </SidebarWidget>

      <SidebarWidget title="Broadcast Activity (Last 7 Days)">
        <BroadcastActivityBars days={supplier.broadcastActivity} />
      </SidebarWidget>

      <SidebarWidget title="Market Trust Signals">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-start gap-2">
            <BadgeCheck className="size-4 shrink-0 text-primary" aria-hidden />
            <div>
              <div className="font-medium text-foreground">Verified Supplier</div>
              <div className="text-xs text-muted-foreground">Identity, business & location verified</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ThumbsUp className="size-4 shrink-0 text-primary" aria-hidden />
            <div>
              <div className="font-medium text-foreground">{supplier.positiveScorePercent}% Positive Score</div>
              <div className="text-xs text-muted-foreground">Based on buyer feedback</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Zap className="size-4 shrink-0 text-primary" aria-hidden />
            <div>
              <div className="font-medium text-foreground">{supplier.avgResponseTimeLabel} Response Speed</div>
              <div className="text-xs text-muted-foreground">Average time to respond to inquiries</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="size-4 shrink-0 text-primary" aria-hidden />
            <div>
              <div className="font-medium text-foreground">{yearsActive}+ years on SouqFeed</div>
              <div className="text-xs text-muted-foreground">Active since {supplier.memberSinceYear}</div>
            </div>
          </div>
        </div>
      </SidebarWidget>
    </div>
  );
}
