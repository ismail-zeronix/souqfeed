import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  if (!authorizeRole(session.user.role, "SUPPLIER")) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }
  return (
    <main>
      <h1>Supplier Dashboard</h1>
      <p>Signed in as {session.user.email}</p>
    </main>
  );
}
