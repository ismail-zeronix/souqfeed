import { BadgeCheck, MessageCircle, Search, TrendingDown } from "lucide-react";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";
import type { OfferListItem } from "@/modules/offers/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_TONES = ["#6c42f5", "#1f7fc4", "#1b8f50", "#c46a14", "#c43a64"];

/** Four visual cards that show what a buyer gets, each with a small drawn example. */
export function FeatureCards({ offers }: { offers: OfferListItem[] }) {
  const first = offers[0];
  const suppliers = Array.from(
    new Map(offers.map((o) => [o.supplierId, o.supplierName])).values(),
  ).slice(0, 5);

  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 pt-10 md:px-5 md:pt-14">
      <div className="max-w-xl">
        <p className="text-primary text-xs font-bold tracking-[0.16em] uppercase">
          Why buyers use it
        </p>
        <h2 className="font-display text-foreground mt-2 text-2xl font-extrabold tracking-tight md:text-4xl">
          Source faster, without the group chats
        </h2>
      </div>

      <div className="mt-6 grid gap-3 md:mt-8 md:grid-cols-12 md:gap-4">
        {/* Search */}
        <article className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#efeaff,#dccfff)] p-5 md:col-span-7 md:min-h-[260px] md:p-7">
          <span className="text-primary flex size-10 items-center justify-center rounded-2xl bg-white">
            <Search className="size-5" aria-hidden />
          </span>
          <h3 className="font-display text-foreground mt-4 text-xl font-extrabold">
            Search by model or part number
          </h3>
          <p className="text-foreground/70 mt-1.5 max-w-sm text-sm leading-5">
            Typos are fine. We match a half-remembered model to the right
            product and show who has it.
          </p>
          <div className="mt-5 max-w-[15rem] rounded-2xl bg-white p-3 shadow-[0_10px_26px_rgba(71,42,170,0.14)]">
            <div className="flex items-center gap-2 text-sm text-[#21184e]">
              <Search className="size-4 text-[#8b83a8]" aria-hidden />
              thinkpd e14
            </div>
            <div className="mt-2.5 rounded-xl bg-[#f3f0ff] px-3 py-2 text-xs font-semibold text-[#21184e]">
              Lenovo ThinkPad E14
              <span className="text-primary ml-2 font-bold">Best match</span>
            </div>
          </div>
          <SouqFeedAgent
            state="searching"
            size="xl"
            alt="SouqFeed mascot searching"
            className="absolute -right-2 -bottom-3 size-32 drop-shadow-[0_14px_14px_rgba(72,34,182,0.25)] sm:size-44"
          />
        </article>

        {/* WhatsApp */}
        <article className="relative overflow-hidden rounded-3xl bg-[#1d1540] p-5 text-white md:col-span-5 md:p-7">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-white/15">
            <MessageCircle className="size-5 text-[#25d366]" aria-hidden />
          </span>
          <h3 className="font-display mt-4 text-xl font-extrabold">
            Chat before you buy
          </h3>
          <p className="mt-1.5 text-sm leading-5 text-white/70">
            Every offer has a live chat. Our sales team connects you with the
            supplier and helps you get the best price.
          </p>
          <div className="mt-5 space-y-2">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[#25d366] px-3.5 py-2 text-[13px] font-medium text-[#06361a]">
              Is the {first ? first.title : "ThinkPad E14"} still available?
            </div>
          </div>
        </article>

        {/* Price movement */}
        <article className="relative overflow-hidden rounded-3xl border border-[#e6e0ff] bg-white p-5 md:col-span-5 md:p-7">
          <span className="text-primary flex size-10 items-center justify-center rounded-2xl bg-[#f0ebff]">
            <TrendingDown className="size-5" aria-hidden />
          </span>
          <h3 className="font-display text-foreground mt-4 text-xl font-extrabold">
            See when prices move
          </h3>
          <p className="text-muted-foreground mt-1.5 text-sm leading-5">
            Every update is kept, so you can see what changed and when.
          </p>
          <svg
            viewBox="0 0 240 70"
            className="mt-4 h-16 w-full"
            aria-hidden
            fill="none"
          >
            <path
              d="M0 14 C30 12 40 30 70 28 S110 10 140 30 S190 50 240 54 V70 H0Z"
              fill="url(#pf)"
              opacity="0.35"
            />
            <path
              d="M0 14 C30 12 40 30 70 28 S110 10 140 30 S190 50 240 54"
              stroke="#6c42f5"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="236" cy="54" r="5" fill="#16a34a" />
            <defs>
              <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#6c42f5" />
                <stop offset="1" stopColor="#6c42f5" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </article>

        {/* Suppliers */}
        <article className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#e5f6ff,#e8e2ff)] p-5 md:col-span-7 md:p-7">
          <span className="text-primary flex size-10 items-center justify-center rounded-2xl bg-white">
            <BadgeCheck className="size-5" aria-hidden />
          </span>
          <h3 className="font-display text-foreground mt-4 text-xl font-extrabold">
            Know who is selling
          </h3>
          <p className="text-foreground/70 mt-1.5 max-w-sm text-sm leading-5">
            Each offer shows the supplier, where they are, and how fresh the
            listing is.
          </p>
          <div className="mt-5 flex items-center">
            {suppliers.map((name, i) => (
              <span
                key={name}
                title={name}
                className="-ml-2 flex size-11 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white first:ml-0"
                style={{ background: AVATAR_TONES[i % AVATAR_TONES.length] }}
              >
                {initials(name)}
              </span>
            ))}
            <span className="text-live ml-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold">
              <BadgeCheck className="size-3.5" aria-hidden />
              Verified
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}
