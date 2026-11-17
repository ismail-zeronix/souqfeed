import type { Metadata } from "next";
import {
  AdminEmptyState,
  AdminPageHeader,
} from "@/components/admin/admin-page";
import {
  PaginationNav,
  parsePage,
} from "@/components/broadcasts/pagination-nav";
import { OfferTabs } from "@/components/offers/offer-tabs";
import { OffersTable } from "@/components/offers/offers-table";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdminPage } from "@/lib/auth/session";
import { listOffersForAdmin } from "@/modules/offers/queries";

export const metadata: Metadata = { title: "Offers" };

export default async function AdminOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string | string[] }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const active = params.view !== "withdrawn";
  const result = await listOffersForAdmin(active, parsePage(params.page));

  return (
    <>
      <AdminPageHeader
        title="Offers"
        description="Every supplier's offers, created when broadcasts are published. History is kept for each."
        actions={<OfferTabs basePath="/admin/offers" showingActive={active} />}
      />
      {result.rows.length === 0 ? (
        <AdminEmptyState>
          {active ? "No live offers yet." : "No sold-out offers."}
        </AdminEmptyState>
      ) : (
        <Card className="py-0">
          <CardContent className="px-2 sm:px-3">
            <OffersTable
              rows={result.rows}
              hrefFor={(id) => `/admin/offers/${id}`}
              showSupplier
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
          `/admin/offers?${active ? "" : "view=withdrawn&"}page=${page}`
        }
      />
    </>
  );
}
