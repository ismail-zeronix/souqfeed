import Link from "next/link";

/** Active / sold-out switch for offer lists, driven by ?view=. */
export function OfferTabs({
  basePath,
  showingActive,
}: {
  basePath: string;
  showingActive: boolean;
}) {
  const tabs = [
    { label: "Active", href: basePath, active: showingActive },
    {
      label: "Sold out",
      href: `${basePath}?view=withdrawn`,
      active: !showingActive,
    },
  ];
  return (
    <nav aria-label="Offer status" className="flex gap-1">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            tab.active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-card hover:text-foreground"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
