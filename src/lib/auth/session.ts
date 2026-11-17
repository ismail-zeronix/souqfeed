import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { authorizeRole } from "@/modules/auth/guards";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * For admin pages. A layout doesn't re-run on client navigation, so every admin
 * page must call this itself rather than relying on the admin layout.
 */
export async function requireAdminPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!authorizeRole(session.user.role, "ADMIN")) redirect("/dashboard");
  return session;
}

/** For admin Server Actions, which are public endpoints whatever page calls them. */
export async function isAdminRequest(): Promise<boolean> {
  const session = await getCurrentSession();
  return Boolean(session && authorizeRole(session.user.role, "ADMIN"));
}
