import { Badge } from "@/components/ui/badge";

const SAMPLE_QUOTES = [
  {
    quote: "Found 3 suppliers with the exact SKU in stock in under a minute.",
    role: "Procurement lead, IT retail reseller — Bur Dubai",
  },
  {
    quote: "No more scrolling through WhatsApp groups to check who has stock.",
    role: "Buyer, systems integrator — Deira",
  },
  {
    quote: "Broadcasting stock here reaches buyers we'd otherwise miss.",
    role: "Owner, networking equipment wholesaler",
  },
  {
    quote: "Price and quantity updates are easy to track without re-asking.",
    role: "Buyer, corporate IT procurement",
  },
];

export function SampleFeedback() {
  return (
    <section className="border-border mx-auto w-full max-w-[1440px] border-t px-6 py-10">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Sample feedback
        </h2>
        <Badge variant="outline">Illustrative — not real accounts</Badge>
      </div>
      <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
        SouqFeed is pre-launch. These are illustrative quotes representing
        anticipated use, not real buyer or supplier accounts.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SAMPLE_QUOTES.map((item) => (
          <div
            key={item.role}
            className="border-border bg-card flex flex-col gap-2 rounded-md border p-4"
          >
            <p className="text-foreground text-sm">
              &ldquo;{item.quote}&rdquo;
            </p>
            <p className="text-muted-foreground text-xs">{item.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
