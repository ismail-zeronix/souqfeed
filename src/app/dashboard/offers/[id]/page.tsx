import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { OfferDetailView } from "@/components/offers/offer-detail";
import { requireSupplierPage } from "@/lib/auth/session";
import { isUuid } from "@/lib/validation/form";
import { getOffer } from "@/modules/offers/queries";

export const metadata: Metadata = {
  title: "Offer",
  robots: { index: false, follow: false },
};

export default async function SupplierOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supplier } = await requireSupplierPage();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  // Scoped to this supplier, so another supplier's offer is simply not found.
  const offer = await getOffer(id, supplier.id);
  if (!offer) notFound();

  return (
    <DashboardPage
      back={{ href: "/dashboard/offers", label: "Your offers" }}
      eyebrow="Offer"
      title={offer.title ?? "Untitled product"}
    >
      <OfferDetailView
        offer={offer}
        broadcastHref={(broadcastId) => `/dashboard/broadcasts/${broadcastId}`}
      />
    </DashboardPage>
  );
}
