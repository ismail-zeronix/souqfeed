import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { WtbRequestSnippet } from "@/modules/offers/types";

export const WTB_SECTION_TITLE = "Latest WTB Requests";

export function WtbRequests({ requests }: { requests: WtbRequestSnippet[] }) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-8 lg:py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-foreground text-xl font-bold tracking-tight">{WTB_SECTION_TITLE}</h2>
          <p className="text-muted-foreground mt-1 text-sm">See what buyers are looking for right now.</p>
        </div>
        <Link href="/feed" className="text-primary flex items-center gap-1 text-xs font-semibold">
          View all WTB requests <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#ebe6ff] bg-white shadow-[0_5px_18px_rgba(71,42,170,0.04)]">
        {requests.map((request, index) => (
          <div key={request.id} className="flex items-center gap-3 border-b border-[#f0edfa] px-4 py-3 last:border-b-0 sm:px-5">
            <span className="bg-[#f0ebff] text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-semibold">{request.title.replace(/^WTB\s+/i, "")}</p>
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs"><MapPin className="size-3" aria-hidden />{request.location} · {request.postedLabel}</p>
            </div>
            <Link href="/feed" className="bg-[#f6f3ff] text-primary shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold hover:bg-[#ebe4ff]">View details</Link>
          </div>
        ))}
      </div>
    </section>
  );
}
