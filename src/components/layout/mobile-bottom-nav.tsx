"use client";

import { type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, Menu, Search, Users } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

function profileHref(
  session: ReturnType<typeof authClient.useSession>["data"],
): string {
  if (!session?.user) return "/login";
  const role = (session.user as { role?: string }).role;
  return role === "ADMIN" ? "/admin" : "/dashboard";
}

function NavItemShell({
  label,
  icon: Icon,
  active,
  disabled,
}: {
  label: string;
  icon: IconType;
  active: boolean;
  disabled?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex min-w-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
        active && "text-primary",
        !active && !disabled && "text-muted-foreground",
        disabled && "text-muted-foreground/50",
      )}
    >
      <Icon className="size-5" aria-hidden />
      {label}
    </span>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  if (pathname.startsWith("/login")) return null;

  const profileActive =
    pathname === "/dashboard" || pathname === "/admin" || pathname === "/login";

  return (
    <nav
      className="border-border bg-card fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t shadow-[0_-4px_18px_rgba(40,16,95,0.06)] md:hidden"
      style={{
        paddingBottom: "max(0px, env(safe-area-inset-bottom))",
      }}
      aria-label="Primary"
    >
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
        <NavItemShell label="Market" icon={Home} active={pathname === "/"} />
      </Link>
      <Link
        href="/feed"
        aria-current={pathname === "/feed" ? "page" : undefined}
      >
        <NavItemShell
          label="Search"
          icon={Search}
          active={pathname === "/feed"}
        />
      </Link>
      <span
        className="cursor-not-allowed"
        aria-disabled
        title="WTB — Coming soon"
      >
        <NavItemShell
          label="WTB"
          icon={ClipboardList}
          active={false}
          disabled
        />
      </span>
      <span
        className="cursor-not-allowed"
        aria-disabled
        title="Suppliers — Coming soon"
      >
        <NavItemShell label="Suppliers" icon={Users} active={false} disabled />
      </span>
      <Link
        href={profileHref(session)}
        aria-current={profileActive ? "page" : undefined}
      >
        <NavItemShell label="More" icon={Menu} active={profileActive} />
      </Link>
    </nav>
  );
}
