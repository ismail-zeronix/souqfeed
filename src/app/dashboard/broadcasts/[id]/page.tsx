import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BroadcastDetailView } from "@/components/broadcasts/broadcast-detail";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { requireSupplierPage } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { isUuid } from "@/lib/validation/form";
import { getBroadcast, listBroadcastItems } from "@/modules/broadcasts/queries";

export const metadata: Metadata = {
  title: "Broadcast",
  robots: { index: false, follow: false },
};

export default async function SupplierBroadcastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supplier } = await requireSupplierPage();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  // Scoped to this supplier, so another supplier's id is simply not found.
  const broadcast = await getBroadcast(id, supplier.id);
  if (!broadcast) notFound();
  const items = await listBroadcastItems(broadcast.id);

  return (
    <DashboardPage
      back={{ href: "/dashboard/broadcasts", label: "Your broadcasts" }}
      eyebrow="Broadcast"
      title={`Posted ${formatDateTime(broadcast.createdAt)}`}
    >
      <BroadcastDetailView broadcast={broadcast} items={items} />
    </DashboardPage>
  );
}
