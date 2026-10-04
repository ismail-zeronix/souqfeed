"use client";

import { type FormEvent, useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignupDialog } from "@/components/layout/signup-dialog";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { label: string; href: string | null }[] = [
  { label: "Home", href: "/" },
  { label: "Live Market", href: "/feed" },
  { label: "Suppliers", href: null },
  { label: "Products", href: null },
  { label: "WTB", href: null },
  { label: "Insights", href: null },
];

/** Header height in px — kept in sync with the `h-16` class below and with
 * home-hero.tsx's `-mt-16` overlap trick. */
const HEADER_HEIGHT = 64;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchId = useId();
  const isHome = pathname === "/";
  const [overHero, setOverHero] = useState(isHome);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isHome) return;
    const heroEl = document.getElementById("home-hero");
    if (!heroEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px` },
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [isHome]);

  const transparent = isHome && overHero;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/feed?q=${encodeURIComponent(trimmed)}` : "/feed");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors",
        transparent
          ? "border-transparent bg-transparent"
          : "border-border bg-card",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-6">
        <Link
          href="/"
          className={cn(
            "flex shrink-0 items-center gap-2 font-semibold transition-colors",
            transparent ? "text-white" : "text-foreground",
          )}
        >
          <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded text-sm font-bold">
            S
          </span>
          SouqFeed
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {NAV_ITEMS.map((item) => {
            if (!item.href) {
              return (
                <span
                  key={item.label}
                  className={cn(
                    "cursor-not-allowed rounded-md px-3 py-2",
                    transparent ? "text-white/40" : "text-muted-foreground/60",
                  )}
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
                  transparent
                    ? isActive
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                    : isActive
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
              className={cn(
                "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
                transparent ? "text-white/60" : "text-muted-foreground",
              )}
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
              className={cn(
                "h-9 pl-9",
                transparent &&
                  "border-white/30 bg-white/10 text-white placeholder:text-white/60 focus-visible:border-white/60",
              )}
            />
          </div>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Bell
            className={cn(
              "hidden size-5 sm:block",
              transparent ? "text-white/80" : "text-muted-foreground",
            )}
            aria-hidden
          />
          <div
            className={cn(
              "hidden items-center gap-1 text-xs font-medium sm:flex",
              transparent ? "text-white/80" : "text-muted-foreground",
            )}
          >
            <Globe className="size-4" aria-hidden />
            UAE
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/login" />}
            className={cn(
              transparent &&
                "border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white",
            )}
          >
            Sign In
          </Button>
          <SignupDialog trigger={<Button>Sign Up</Button>} />
        </div>
      </div>
    </header>
  );
}
