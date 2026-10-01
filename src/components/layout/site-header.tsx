import Link from "next/link";
import { Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS: { label: string; href: string | null }[] = [
  { label: "Live Market", href: "/feed" },
  { label: "Suppliers", href: null },
  { label: "Search", href: null },
  { label: "WTB", href: null },
  { label: "Insights", href: null },
];

export function SiteHeader() {
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

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_ITEMS.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="border-primary text-foreground border-b-2 py-4"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="text-muted-foreground cursor-default py-4"
                aria-disabled
              >
                {item.label}
              </span>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Bell className="text-muted-foreground size-5" aria-hidden />
          <Globe className="text-muted-foreground size-5" aria-hidden />
          <Button>Sign In</Button>
        </div>
      </div>
    </header>
  );
}
