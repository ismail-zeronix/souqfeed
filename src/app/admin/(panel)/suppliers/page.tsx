import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { AdminSupplierTable } from "@/components/admin/admin-supplier-table";
import { requireAdminPage } from "@/lib/auth/session";
import { listSuppliersForAdmin } from "@/modules/suppliers/queries";

export const metadata: Metadata = { title: "Suppliers" };

export default async function AdminSuppliersPage() {
  await requireAdminPage();
  const suppliers = await listSuppliersForAdmin();

  return (
    <>
      <AdminPageHeader
        title="Suppliers"
        description="Deactivating a supplier hides their public profile. Verifying adds the verified badge."
      />
      <AdminSupplierTable suppliers={suppliers} />
    </>
  );
}
