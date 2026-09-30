import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";

export default async function AdminPage() {
  const session = await getCurrentSession();
  if (!session || !authorizeRole(session.user.role, "ADMIN")) {
    redirect("/login");
  }
  return (
    <main>
      <h1>Admin Panel</h1>
      <p>Signed in as {session.user.email}</p>
    </main>
  );
}
