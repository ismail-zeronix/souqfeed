import { AdminSupplierTable } from "@/components/admin/admin-supplier-table";
import { requireAdminPage } from "@/lib/auth/session";
import { listSuppliersForAdmin } from "@/modules/suppliers/queries";

export default async function AdminSuppliersPage() {
  await requireAdminPage();
  const suppliers = await listSuppliersForAdmin();

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Suppliers</h1>
      <p className="text-muted-foreground mt-3 mb-6 text-sm">
        Deactivating a supplier hides their public profile. Verifying adds the
        verified badge.
      </p>
      <AdminSupplierTable suppliers={suppliers} />
    </>
  );
}
