import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdminPage } from "@/lib/auth/session";

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
    <main className="bg-muted/30 flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          Admin
        </p>
        <p className="text-muted-foreground mt-1 mb-5 text-sm">
          Signed in as {session.user.email}
        </p>
        <AdminNav />
        {children}
      </div>
    </main>
  );
}
