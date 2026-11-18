"use client";

import { type FormEvent, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignupDialog } from "@/components/layout/signup-dialog";
import { MobileHeader } from "@/components/layout/mobile-header";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import { isStaffRole } from "@/modules/auth/guards";
import { CategoryMegaMenu } from "@/components/layout/category-mega-menu";
import type { MenuCategory } from "@/modules/categories/menu-shared";
import { HeaderMascot } from "@/components/layout/header-mascot";
import { hidesSiteChrome } from "@/components/layout/site-chrome";

export const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Market", href: "/feed" },
  { label: "Suppliers", href: "/suppliers" },
  { label: "WTB Requests", href: "/wtb" },
  { label: "How It Works", href: "/#how-it-works" },
];

function isActiveLink(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader({ categories }: { categories: MenuCategory[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const { data: session } = authClient.useSession();

  if (hidesSiteChrome(pathname)) return null;

  const user = session?.user as
    | { name?: string; email?: string; image?: string | null; role?: string }
    | undefined;
  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "Account";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search",
    );
  }

  return (
    <>
      {!pathname.startsWith("/feed") && !pathname.startsWith("/suppliers/") && (
        <MobileHeader categories={categories} />
      )}
      <header className="border-border bg-card sticky top-0 z-50 hidden border-b md:block">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-[15px] font-bold tracking-tight"
          >
            <HeaderMascot />
            <span className="text-foreground">
              Souq<span className="text-primary">Feed</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-[13px] font-semibold lg:flex">
            {NAV_LINKS.slice(0, 1).map((item) => (
              <NavLink key={item.label} item={item} pathname={pathname} />
            ))}
            <CategoryMegaMenu categories={categories} />
            {NAV_LINKS.slice(1).map((item) => (
              <NavLink key={item.label} item={item} pathname={pathname} />
            ))}
          </nav>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden flex-1 justify-center xl:flex"
          >
            <div className="relative w-full max-w-sm">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden
              />
              <label htmlFor={searchId} className="sr-only">
                Search the market
              </label>
              <Input
                id={searchId}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search model, SKU, part number, specification..."
                className="h-9 rounded-xl pl-9 text-xs"
              />
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <Link
              href="/search"
              aria-label="Search the market"
              className="hover:text-primary text-slate-600 xl:hidden"
            >
              <Search className="size-5" aria-hidden />
            </Link>
            <div className="relative hidden sm:block">
              <Bell className="size-5 text-slate-600" aria-hidden />
              <span
                className="bg-destructive absolute -top-0.5 -right-0.5 size-1.5 rounded-full"
                aria-label="New notification"
              />
            </div>
            {session?.user ? (
              <div className="hidden items-center gap-2 sm:flex">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-xs font-bold">
                    {initials}
                  </div>
                )}
                <div className="hidden leading-tight lg:block">
                  <div className="text-foreground text-xs font-semibold">
                    {displayName}
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    {user?.role === "SUPPLIER"
                      ? "Seller"
                      : isStaffRole(user?.role)
                        ? "Admin"
                        : "Buyer"}
                  </div>
                </div>
                <ChevronDown className="size-3.5 text-slate-500" aria-hidden />
              </div>
            ) : (
              <SignupDialog
                trigger={
                  <Button className="rounded-lg px-4 text-xs">Sign up</Button>
                }
              />
            )}
            {session?.user ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Sign out"
                onClick={() =>
                  authClient.signOut({
                    fetchOptions: { onSuccess: () => router.push("/") },
                  })
                }
              >
                <LogOut className="size-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/login" />}
                className="hidden rounded-lg px-4 text-xs sm:inline-flex"
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

function NavLink({
  item,
  pathname,
}: {
  item: { label: string; href: string };
  pathname: string;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "rounded-lg px-3 py-2 transition-colors",
        isActiveLink(pathname, item.href)
          ? "bg-primary/10 text-primary"
          : "hover:bg-primary/5 hover:text-primary text-slate-600",
      )}
    >
      {item.label}
    </Link>
  );
}
