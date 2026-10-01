import Link from "next/link";

const PLATFORM_LINKS: { label: string; href: string | null }[] = [
  { label: "Live Market", href: "/feed" },
  { label: "Suppliers", href: null },
  { label: "Search", href: null },
  { label: "WTB", href: null },
];

const LEGAL_LINKS: string[] = ["Terms", "Privacy", "Contact"];

export function SiteFooter() {
  return (
    <footer className="border-border bg-card border-t">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <div className="text-foreground flex items-center gap-2 font-semibold">
            <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded text-xs font-bold">
              S
            </span>
            SouqFeed
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Structured, searchable offers from Dubai&apos;s IT wholesale
            WhatsApp market.
          </p>
        </div>

        <div className="flex gap-12">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs font-semibold uppercase">
              Platform
            </span>
            {PLATFORM_LINKS.map((link) =>
              link.href ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-foreground hover:text-primary text-sm"
                >
                  {link.label}
                </Link>
              ) : (
                <span
                  key={link.label}
                  className="text-muted-foreground text-sm"
                  aria-disabled
                >
                  {link.label}
                </span>
              ),
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs font-semibold uppercase">
              Legal
            </span>
            {LEGAL_LINKS.map((label) => (
              <span
                key={label}
                className="text-muted-foreground text-sm"
                aria-disabled
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-border border-t">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-4 text-center">
          <span className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} SouqFeed. Dubai, UAE.
          </span>
        </div>
      </div>
    </footer>
  );
}
