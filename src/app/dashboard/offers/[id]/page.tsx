import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { supplier } = await requireSupplierPage();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  // Scoped to this supplier, so another supplier's offer is simply not found.
  const offer = await getOffer(id, supplier.id);
  if (!offer) notFound();
  const { saved } = await searchParams;

  return (
    <DashboardPage
      back={{ href: "/dashboard/offers", label: "Your offers" }}
      eyebrow="Offer"
      title={offer.title ?? "Untitled product"}
    >
      {saved && (
        <p
          role="status"
          className="border-primary/30 bg-primary/5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
        >
          <CircleCheck className="text-primary size-5 shrink-0" aria-hidden />
          Update published. Buyers now see it as just confirmed.
        </p>
      )}
      <OfferDetailView
        offer={offer}
        broadcastHref={(broadcastId) => `/dashboard/broadcasts/${broadcastId}`}
        updateHref={`/dashboard/offers/new?offer=${offer.id}`}
      />
    </DashboardPage>
  );
}
