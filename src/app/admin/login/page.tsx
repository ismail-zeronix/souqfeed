import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getCurrentSession } from "@/lib/auth/session";
import { isStaffRole } from "@/modules/auth/guards";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getCurrentSession();
  if (session && isStaffRole(session.user.role)) redirect("/admin");

  return <AdminLoginForm />;
}
