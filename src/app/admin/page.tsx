import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  if (!authorizeRole(session.user.role, "ADMIN")) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }
  return (
    <main>
      <h1>Admin Panel</h1>
      <p>Signed in as {session.user.email}</p>
    </main>
  );
}
