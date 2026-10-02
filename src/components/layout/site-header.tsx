"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignupDialog } from "@/components/layout/signup-dialog";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { label: string; href: string | null }[] = [
  { label: "Home", href: "/" },
  { label: "Live Market", href: "/feed" },
  { label: "Suppliers", href: null },
  { label: "Search", href: null },
  { label: "WTB", href: null },
  { label: "Insights", href: null },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-border bg-card border-b">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="text-foreground flex shrink-0 items-center gap-2 font-semibold"
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

        <div className="flex shrink-0 items-center gap-3">
          <Bell
            className="text-muted-foreground hidden size-5 sm:block"
            aria-hidden
          />
          <Globe
            className="text-muted-foreground hidden size-5 sm:block"
            aria-hidden
          />
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
  );
}
