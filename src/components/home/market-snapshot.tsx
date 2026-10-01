import Link from "next/link";
import { SidebarWidget } from "@/components/ui/sidebar-widget";
import { SupplierLogoTile } from "@/components/ui/supplier-logo-tile";
import { getTopBrandsByOfferCount } from "@/modules/offers/top-brands";
import type { OfferListItem, WtbRequestSnippet } from "@/modules/offers/types";
import type { SupplierSummary } from "@/modules/suppliers/types";

export function MarketSnapshot({
  offers,
  suppliers,
  wtbRequests,
}: {
  offers: OfferListItem[];
  suppliers: SupplierSummary[];
  wtbRequests: WtbRequestSnippet[];
}) {
  const topBrands = getTopBrandsByOfferCount(offers, 6);
  const topSuppliers = [...suppliers]
    .sort((a, b) => b.activeOfferCount - a.activeOfferCount)
    .slice(0, 4);

  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-10">
      <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
        Market Snapshot
      </h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SidebarWidget title="Active Suppliers">
          {topSuppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/suppliers/${supplier.slug}`}
              className="hover:bg-primary/5 -mx-2 flex items-center gap-2 rounded px-2 py-1 text-sm"
            >
              <SupplierLogoTile initial={supplier.logoInitial} size="sm" />
              <div className="min-w-0">
                <div className="text-foreground truncate font-medium">
                  {supplier.companyName}
                </div>
                <div className="text-muted-foreground text-xs">
                  {supplier.activeOfferCount} offers ·{" "}
                  {supplier.positiveScorePercent}% positive
                </div>
              </div>
            </Link>
          ))}
        </SidebarWidget>

        <SidebarWidget title="Want To Buy">
          {wtbRequests.slice(0, 4).map((request) => (
            <div key={request.id} className="text-sm">
              <div className="text-foreground">{request.title}</div>
              <div className="text-muted-foreground text-xs">
                {request.location} · {request.postedLabel}
              </div>
            </div>
          ))}
        </SidebarWidget>

        <SidebarWidget title="Top Brands">
          <div className="flex flex-wrap gap-1.5">
            {topBrands.map((brand) => (
              <span
                key={brand.brandId}
                className="border-border text-foreground rounded-full border px-2.5 py-1 text-xs font-medium"
              >
                {brand.brandName}
                <span className="text-muted-foreground ml-1 tabular-nums">
                  {brand.offerCount}
                </span>
              </span>
            ))}
          </div>
        </SidebarWidget>
      </div>
    </section>
  );
}
