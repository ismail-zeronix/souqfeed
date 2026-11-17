import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireAdminPage } from "@/lib/auth/session";
import { authorizeRole } from "@/modules/auth/guards";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · SouqFeed Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminPage();
  // The sidebar remembers whether it was collapsed in this cookie.
  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={sidebarOpen} className="bg-muted/40">
        <AdminSidebar
          name={session.user.name}
          email={session.user.email}
          isSuperAdmin={authorizeRole(session.user.role, "SUPER_ADMIN")}
        />
        <SidebarInset className="bg-muted/40">
          <AdminHeader />
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
