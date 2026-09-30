import Link from "next/link";
import { Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS: { label: string; href: string | null }[] = [
  { label: "Live Market", href: "/" },
  { label: "Suppliers", href: null },
  { label: "Search", href: null },
  { label: "WTB", href: null },
  { label: "Insights", href: null },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold text-foreground">
          <span className="flex size-7 items-center justify-center rounded bg-primary text-sm font-bold text-primary-foreground">
            S
          </span>
          SouqFeed
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_ITEMS.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href} className="border-b-2 border-primary py-4 text-foreground">
                {item.label}
              </Link>
            ) : (
              <span key={item.label} className="cursor-default py-4 text-muted-foreground" aria-disabled>
                {item.label}
              </span>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Bell className="size-5 text-muted-foreground" aria-hidden />
          <Globe className="size-5 text-muted-foreground" aria-hidden />
          <Button>Sign In</Button>
        </div>
      </div>
    </header>
  );
}
