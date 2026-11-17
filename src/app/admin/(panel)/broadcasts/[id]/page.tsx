import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { BroadcastDetailView } from "@/components/broadcasts/broadcast-detail";
import { Button } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/auth/session";
import { isUuid } from "@/lib/validation/form";
import { getBroadcast, listBroadcastItems } from "@/modules/broadcasts/queries";

export const metadata: Metadata = { title: "Broadcast" };

export default async function AdminBroadcastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const broadcast = await getBroadcast(id);
  if (!broadcast) notFound();
  const items = await listBroadcastItems(broadcast.id);

  return (
    <>
      <AdminPageHeader
        title={broadcast.supplierName}
        description="Broadcast posted by this supplier."
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                href={`/suppliers/${broadcast.supplierSlug}`}
                target="_blank"
                rel="noopener"
              />
            }
          >
            <ExternalLink aria-hidden />
            Supplier profile
          </Button>
        }
      />
      <BroadcastDetailView broadcast={broadcast} items={items} />
    </>
  );
}
