import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { requireAdminPage } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminPage();

  return (
    <div className="bg-muted/30 flex min-h-screen flex-1 flex-col">
      <AdminTopBar
        email={session.user.email}
        isSuperAdmin={authorizeRole(session.user.role, "SUPER_ADMIN")}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <AdminNav />
        {children}
      </main>
    </div>
  );
}
