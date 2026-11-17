import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { OfferDetailView } from "@/components/offers/offer-detail";
import { requireAdminPage } from "@/lib/auth/session";
import { isUuid } from "@/lib/validation/form";
import { getOffer } from "@/modules/offers/queries";

export const metadata: Metadata = { title: "Offer" };

export default async function AdminOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const offer = await getOffer(id);
  if (!offer) notFound();

  return (
    <>
      <AdminPageHeader
        title={offer.title ?? "Untitled product"}
        description={`Offer from ${offer.supplierName}.`}
      />
      <OfferDetailView
        offer={offer}
        broadcastHref={(broadcastId) => `/admin/broadcasts/${broadcastId}`}
      />
    </>
  );
}
