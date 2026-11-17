"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ADMIN_NAV,
  isNavItemActive,
} from "@/components/admin/admin-nav-config";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export function AdminSidebar({
  name,
  email,
  isSuperAdmin,
}: {
  name: string;
  email: string;
  isSuperAdmin: boolean;
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  // On phones the sidebar is a sheet; close it once a page is picked.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/admin" onClick={closeOnMobile} />}
            >
              <span className="bg-sidebar-primary/10 flex aspect-square size-8 items-center justify-center rounded-lg">
                <Image
                  src="/logo-icon.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="size-5"
                />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">SouqFeed</span>
                <span className="text-muted-foreground truncate text-xs">
                  Admin console
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {ADMIN_NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isNavItemActive(item.href, pathname)}
                      tooltip={item.title}
                      render={<Link href={item.href} onClick={closeOnMobile} />}
                    >
                      <item.icon aria-hidden />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <AdminUserMenu name={name} email={email} isSuperAdmin={isSuperAdmin} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
