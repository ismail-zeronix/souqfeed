import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, MapPin, Search } from "lucide-react";
import type { WtbRequestSnippet } from "@/modules/offers/types";

export const WTB_SECTION_TITLE = "Latest WTB Requests";

export function WtbRequests({ requests }: { requests: WtbRequestSnippet[] }) {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 py-7 lg:py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            {WTB_SECTION_TITLE}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Turn buyer demand into your next deal.
          </p>
        </div>
        <Link
          href="/feed"
          className="text-primary flex items-center gap-1 text-xs font-semibold"
        >
          View all WTB requests <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {requests.map((request, index) => (
          <article
            key={request.id}
            className="group rounded-2xl border border-[#ebe6ff] bg-white p-4 shadow-[0_5px_18px_rgba(71,42,170,0.04)] transition hover:-translate-y-0.5 hover:border-[#cfc4ff] hover:shadow-[0_10px_26px_rgba(71,42,170,0.1)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-primary inline-flex items-center gap-1.5 rounded-full bg-[#f0ebff] px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase">
                <Search className="size-3" aria-hidden />
                Buyer request
              </span>
              <span className="text-muted-foreground text-[11px] font-medium">
                #{String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="text-foreground mt-3 line-clamp-2 text-sm leading-5 font-semibold">
              {request.title.replace(/^WTB\s+/i, "")}
            </h3>
            <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {request.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3.5" aria-hidden />
                {request.postedLabel}
              </span>
            </div>
            <Link
              href="/feed"
              className="text-primary mt-4 inline-flex items-center gap-1 text-xs font-semibold"
            >
              Find a match{" "}
              <ArrowUpRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
