import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock3, Info, MapPin, Plus } from "lucide-react";
import { PageBanner } from "@/components/layout/page-banner";
import { SignupDialog } from "@/components/layout/signup-dialog";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";
import { cn } from "@/lib/utils";
import { getSampleWtbRequests, wtbCategories } from "@/modules/wtb/mock-data";

export const metadata: Metadata = {
  title: "WTB requests — What buyers are looking for",
  description:
    "Want-to-buy requests from IT buyers in the UAE. See what they need and offer it from your stock.",
};

const STEPS = [
  {
    state: "idle",
    title: "Buyer posts a need",
    text: "Model, quantity, condition and area, in under a minute.",
  },
  {
    state: "waving",
    title: "Suppliers see it",
    text: "Suppliers with matching stock get the request in front of them.",
  },
  {
    state: "happy",
    title: "Deal on WhatsApp",
    text: "The supplier replies directly, so the price is settled in the chat.",
  },
] as const;

const TAG_STYLES = {
  Urgent: "bg-[#ffe9ef] text-[#c43a64]",
  Corporate: "bg-[#e3f3ff] text-[#1f7fc4]",
} as const;

export default async function WtbPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams).category;
  const selected = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  const all = getSampleWtbRequests();
  const categories = wtbCategories(all);
  const requests = selected
    ? all.filter((request) => request.categoryName === selected)
    : all;

  return (
    <>
      <div
        role="note"
        className="border-primary/20 bg-primary/5 mx-auto flex w-full max-w-[1440px] items-start gap-2 border-b px-4 py-2.5 text-xs sm:items-center sm:px-6"
      >
        <Info
          className="text-primary mt-0.5 size-4 shrink-0 sm:mt-0"
          aria-hidden
        />
        <p>
          <span className="font-semibold">Sample requests.</span> Buyers will be
          able to post want-to-buy requests soon. These show how they will look.
        </p>
      </div>

      <div className="mx-auto w-full max-w-[1240px] px-4 py-5 md:px-5 md:py-8">
        <PageBanner
          eyebrow="Want to buy"
          title="What buyers are looking for"
          description="Demand from IT buyers across the UAE. Have the stock? Search the market for a match and message them."
          mascot="searching"
        >
          <SignupDialog
            trigger={
              <button
                type="button"
                className="font-display inline-flex h-11 items-center gap-2 rounded-full bg-[#1d1540] px-6 text-sm font-bold text-white hover:bg-[#2a1f5c]"
              >
                <Plus className="size-4" aria-hidden />
                Post a request
              </button>
            }
          />
        </PageBanner>

        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex items-center gap-3 rounded-3xl border border-[#e6e0ff] bg-white p-4"
            >
              <SouqFeedAgent
                state={step.state}
                size="md"
                alt=""
                className="size-14"
              />
              <div>
                <p className="font-display text-foreground text-sm font-extrabold">
                  {i + 1}. {step.title}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs leading-4">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <nav
          aria-label="Filter by category"
          className="mt-6 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
        >
          {[
            { label: "All", value: "" },
            ...categories.map((c) => ({ label: c, value: c })),
          ].map((chip) => (
            <Link
              key={chip.label}
              href={
                chip.value
                  ? `/wtb?category=${encodeURIComponent(chip.value)}`
                  : "/wtb"
              }
              aria-current={selected === chip.value ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors",
                selected === chip.value
                  ? "border-[#1d1540] bg-[#1d1540] text-white"
                  : "border-[#e6e0ff] bg-white text-slate-600 hover:border-[#b9a6ff]",
              )}
            >
              {chip.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <article
              key={request.id}
              className="group flex flex-col rounded-3xl border border-[#e6e0ff] bg-white p-5 shadow-[0_6px_20px_rgba(71,42,170,0.05)] transition hover:-translate-y-0.5 hover:border-[#cfc4ff] hover:shadow-[0_12px_30px_rgba(71,42,170,0.12)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-primary rounded-full bg-[#f0ebff] px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase">
                  {request.categoryName}
                </span>
                {request.tag && (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase",
                      TAG_STYLES[request.tag],
                    )}
                  >
                    {request.tag}
                  </span>
                )}
              </div>
              <h2 className="font-display text-foreground mt-3 text-base leading-snug font-extrabold">
                {request.title}
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-[#f8f6ff] px-3 py-2">
                  <dt className="text-muted-foreground">Quantity</dt>
                  <dd className="text-foreground font-semibold">
                    {request.quantity ?? "Any"}
                  </dd>
                </div>
                <div className="rounded-xl bg-[#f8f6ff] px-3 py-2">
                  <dt className="text-muted-foreground">Condition</dt>
                  <dd className="text-foreground font-semibold">
                    {request.condition}
                  </dd>
                </div>
              </dl>
              {request.note && (
                <p className="text-muted-foreground mt-3 text-[13px] leading-5">
                  {request.note}
                </p>
              )}
              <div className="text-muted-foreground mt-3 mb-4 flex items-center gap-4 text-xs">
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
                href={`/search?q=${encodeURIComponent(request.title)}`}
                className="bg-primary/10 text-primary hover:bg-primary/15 mt-auto inline-flex items-center justify-center gap-1 rounded-full px-4 py-2 text-[13px] font-bold"
              >
                Find a match
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
