import { BadgeCheck, Calendar, ThumbsUp, Zap } from "lucide-react";
import { SidebarWidget } from "@/components/ui/sidebar-widget";
import { CategoryMixDonut } from "@/components/suppliers/category-mix-donut";
import { BroadcastActivityBars } from "@/components/suppliers/broadcast-activity-bars";
import { formatTenure } from "@/components/suppliers/supplier-metrics";
import type { SupplierProfile } from "@/modules/suppliers/types";

function NoDataYet() {
  return <p className="text-muted-foreground text-sm">No data yet.</p>;
}

export function SupplierInsightsSidebar({
  supplier,
}: {
  supplier: SupplierProfile;
}) {
  const tenure = formatTenure(
    supplier.memberSinceYear,
    new Date().getFullYear(),
  );

  return (
    <div className="flex flex-col gap-4">
      <SidebarWidget
        title="Top Brands Supplied"
        showViewAll={supplier.topBrands.length > 0}
      >
        {supplier.topBrands.length === 0 && <NoDataYet />}
        {supplier.topBrands.map((brand) => (
          <div
            key={brand.brandId}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-foreground">{brand.brandName}</span>
            <span className="text-muted-foreground tabular-nums">
              {brand.sharePercent}%
            </span>
          </div>
        ))}
      </SidebarWidget>

      <SidebarWidget title="Category Mix">
        {supplier.categoryMix.length === 0 ? (
          <NoDataYet />
        ) : (
          <CategoryMixDonut
            slices={supplier.categoryMix}
            totalLabel={`${supplier.activeOfferCount} Active Offers`}
          />
        )}
      </SidebarWidget>

      <SidebarWidget title="Broadcast Activity (Last 7 Days)">
        {supplier.broadcastActivity.length === 0 ? (
          <NoDataYet />
        ) : (
          <BroadcastActivityBars days={supplier.broadcastActivity} />
        )}
      </SidebarWidget>

      <SidebarWidget title="Market Trust Signals">
        <div className="flex flex-col gap-3 text-sm">
          {supplier.verified && (
            <div className="flex items-start gap-2">
              <BadgeCheck
                className="text-primary size-4 shrink-0"
                aria-hidden
              />
              <div>
                <div className="text-foreground font-medium">
                  Verified Supplier
                </div>
                <div className="text-muted-foreground text-xs">
                  Identity, business & location verified
                </div>
              </div>
            </div>
          )}
          {supplier.positiveScorePercent > 0 && (
            <div className="flex items-start gap-2">
              <ThumbsUp className="text-primary size-4 shrink-0" aria-hidden />
              <div>
                <div className="text-foreground font-medium">
                  {supplier.positiveScorePercent}% Positive Score
                </div>
                <div className="text-muted-foreground text-xs">
                  Based on buyer feedback
                </div>
              </div>
            </div>
          )}
          {supplier.avgResponseTimeLabel !== "—" && (
            <div className="flex items-start gap-2">
              <Zap className="text-primary size-4 shrink-0" aria-hidden />
              <div>
                <div className="text-foreground font-medium">
                  {supplier.avgResponseTimeLabel} Response Speed
                </div>
                <div className="text-muted-foreground text-xs">
                  Average time to respond to inquiries
                </div>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Calendar className="text-primary size-4 shrink-0" aria-hidden />
            <div>
              <div className="text-foreground font-medium">
                {tenure === "New" ? "New on SouqFeed" : `${tenure} on SouqFeed`}
              </div>
              <div className="text-muted-foreground text-xs">
                Active since {supplier.memberSinceYear}
              </div>
            </div>
          </div>
        </div>
      </SidebarWidget>
    </div>
  );
}
