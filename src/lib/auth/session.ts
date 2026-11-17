import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { authorizeRole, isStaffRole } from "@/modules/auth/guards";
import { getSupplierAccount } from "@/modules/suppliers/queries";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * For admin pages. A layout doesn't re-run on client navigation, so every admin
 * page must call this itself rather than relying on the admin layout.
 * Buyers and suppliers go back to their own dashboard.
 */
export async function requireAdminPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/admin/login");
  if (!isStaffRole(session.user.role)) redirect("/dashboard");
  return session;
}

/** For admin Server Actions, which are public endpoints whatever page calls them. */
export async function isAdminRequest(): Promise<boolean> {
  const session = await getCurrentSession();
  return Boolean(session && isStaffRole(session.user.role));
}

/**
 * For supplier-only pages under /dashboard. Anyone else, or a supplier who
 * hasn't created a profile yet, goes back to /dashboard, which routes them.
 */
export async function requireSupplierPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!authorizeRole(session.user.role, "SUPPLIER")) redirect("/dashboard");
  const supplier = await getSupplierAccount(session.user.id);
  if (!supplier) redirect("/dashboard");
  return { session, supplier };
}
