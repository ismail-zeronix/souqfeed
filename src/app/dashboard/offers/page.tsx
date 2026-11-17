import type { Metadata } from "next";
import Link from "next/link";
import {
  PaginationNav,
  parsePage,
} from "@/components/broadcasts/pagination-nav";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { OfferTabs } from "@/components/offers/offer-tabs";
import { OffersTable } from "@/components/offers/offers-table";
import { Card, CardContent } from "@/components/ui/card";
import { requireSupplierPage } from "@/lib/auth/session";
import { listSupplierOffers } from "@/modules/offers/queries";

export const metadata: Metadata = {
  title: "Your offers",
  robots: { index: false, follow: false },
};

export default async function SupplierOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string | string[] }>;
}) {
  const { supplier } = await requireSupplierPage();
  const params = await searchParams;
  const active = params.view !== "withdrawn";
  const result = await listSupplierOffers(
    supplier.id,
    active,
    parsePage(params.page),
  );

  return (
    <DashboardPage
      back={{ href: "/dashboard", label: "Dashboard" }}
      eyebrow="Offers"
      title="Your offers"
      description="One offer per product, updated each time you publish a broadcast that lists it. Buyers see how recently each was confirmed."
      actions={
        <OfferTabs basePath="/dashboard/offers" showingActive={active} />
      }
    >
      {result.rows.length === 0 ? (
        <div className="bg-card text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
          {active ? (
            <>
              No live offers yet.{" "}
              <Link
                href="/dashboard/broadcasts/new"
                className="text-primary hover:underline"
              >
                Post a broadcast
              </Link>{" "}
              and publish it to create them.
            </>
          ) : (
            "No sold-out offers."
          )}
        </div>
      ) : (
        <Card className="py-0">
          <CardContent className="px-2 sm:px-3">
            <OffersTable
              rows={result.rows}
              hrefFor={(id) => `/dashboard/offers/${id}`}
              showSupplier={false}
            />
          </CardContent>
        </Card>
      )}
      <PaginationNav
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        noun={["offer", "offers"]}
        hrefFor={(page) =>
          `/dashboard/offers?${active ? "" : "view=withdrawn&"}page=${page}`
        }
      />
    </DashboardPage>
  );
}
