"use client";

import { type FormEvent, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignupDialog } from "@/components/layout/signup-dialog";
import { MobileHeader } from "@/components/layout/mobile-header";
import { cn } from "@/lib/utils";

export const NAV_ITEMS: { label: string; href: string | null }[] = [
  { label: "Home", href: "/" },
  { label: "Live Market", href: "/feed" },
  { label: "Suppliers", href: null },
  { label: "Products", href: null },
  { label: "WTB", href: null },
  { label: "Insights", href: null },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchId = useId();
  const [query, setQuery] = useState("");

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/feed?q=${encodeURIComponent(trimmed)}` : "/feed");
  }

  return (
    <>
      <MobileHeader />
      <header className="border-border bg-card hidden border-b md:block">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-semibold"
          >
            <Image src="/logo-icon.svg" alt="" width={26} height={28} />
            <span className="text-foreground">
              Souq<span className="text-primary">Feed</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            {NAV_ITEMS.map((item) => {
              if (!item.href) {
                return (
                  <span
                    key={item.label}
                    className="text-muted-foreground/60 cursor-not-allowed rounded-md px-3 py-2"
                    aria-disabled
                    title="Coming soon"
                  >
                    {item.label}
                  </span>
                );
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden flex-1 justify-center lg:flex"
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
                placeholder="Search model, SKU, part number..."
                className="h-9 pl-9"
              />
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <Bell
              className="text-muted-foreground hidden size-5 sm:block"
              aria-hidden
            />
            <div className="text-muted-foreground hidden items-center gap-1 text-xs font-medium sm:flex">
              <Globe className="size-4" aria-hidden />
              UAE
            </div>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Sign In
            </Button>
            <SignupDialog trigger={<Button>Sign Up</Button>} />
          </div>
        </div>
      </header>
    </>
  );
}
