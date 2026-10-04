import { Quote, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SAMPLE_QUOTES = [
  {
    quote: "Found 3 suppliers with the exact SKU in stock in under a minute.",
    role: "Procurement lead",
    market: "IT retail reseller · Bur Dubai",
  },
  {
    quote: "No more scrolling through WhatsApp groups to check who has stock.",
    role: "Buyer",
    market: "Systems integrator · Deira",
  },
  {
    quote: "Broadcasting stock here reaches buyers we would otherwise miss.",
    role: "Owner",
    market: "Networking equipment wholesaler",
  },
  {
    quote: "Price and quantity updates are easy to track without re-asking.",
    role: "Buyer",
    market: "Corporate IT procurement",
  },
];

export function SampleFeedback() {
  return (
    <section className="mx-auto w-full max-w-[1180px] border-t border-[#ebe6ff] px-5 py-10 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              What the market needs
            </h2>
            <Badge variant="outline" className="text-[10px]">
              Illustrative feedback
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            A preview of the outcomes SouqFeed is designed to create for buyers
            and suppliers.
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span className="flex gap-0.5 text-amber-400" aria-label="Five stars">
            <Star className="size-3 fill-current" />
            <Star className="size-3 fill-current" />
            <Star className="size-3 fill-current" />
            <Star className="size-3 fill-current" />
            <Star className="size-3 fill-current" />
          </span>{" "}
          Built around real market friction
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SAMPLE_QUOTES.map((item) => (
          <article
            key={item.role + item.market}
            className="group relative flex min-h-[190px] flex-col rounded-2xl border border-[#ebe6ff] bg-white p-5 shadow-[0_5px_18px_rgba(71,42,170,0.04)] transition hover:-translate-y-0.5 hover:border-[#cfc4ff] hover:shadow-[0_10px_26px_rgba(71,42,170,0.1)]"
          >
            <Quote
              className="text-primary/15 absolute top-4 right-4 size-8 fill-current"
              aria-hidden
            />
            <div className="flex gap-0.5 text-amber-400">
              <Star className="size-3.5 fill-current" />
              <Star className="size-3.5 fill-current" />
              <Star className="size-3.5 fill-current" />
              <Star className="size-3.5 fill-current" />
              <Star className="size-3.5 fill-current" />
            </div>
            <p className="text-foreground mt-4 text-sm leading-5">
              “{item.quote}”
            </p>
            <div className="text-muted-foreground mt-auto pt-5 text-xs">
              <p className="text-foreground font-semibold">{item.role}</p>
              <p className="mt-0.5">{item.market}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
