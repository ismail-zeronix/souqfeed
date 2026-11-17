import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BuyerDashboard } from "@/components/dashboard/buyer-dashboard";
import { SupplierDashboard } from "@/components/dashboard/supplier-dashboard";
import { getCurrentSession } from "@/lib/auth/session";
import {
  authorizeRole,
  canAccessUserDashboard,
  isStaffRole,
} from "@/modules/auth/guards";
import { listBrands } from "@/modules/brands/queries";
import { listCategories } from "@/modules/categories/queries";
import { getSupplierByUserId } from "@/modules/suppliers/queries";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!canAccessUserDashboard(session.user.role))
    redirect(isStaffRole(session.user.role) ? "/admin" : "/login");

  const displayName = session.user.name?.split(" ")[0] || "there";

  if (!authorizeRole(session.user.role, "SUPPLIER")) {
    return <BuyerDashboard displayName={displayName} />;
  }

  const [supplier, brands, categories] = await Promise.all([
    getSupplierByUserId(session.user.id),
    listBrands(),
    listCategories(),
  ]);

  return (
    <SupplierDashboard
      displayName={displayName}
      supplier={supplier}
      brands={brands}
      categories={categories}
    />
  );
}
