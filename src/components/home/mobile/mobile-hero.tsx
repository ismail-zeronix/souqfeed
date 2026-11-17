import Link from "next/link";
import { ArrowRight, Package, Sparkles } from "lucide-react";
import { SignupDialog } from "@/components/layout/signup-dialog";
import { GlassCard, HeroRings, PhoneFeed } from "@/components/home/hero-art";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";
import type { OfferListItem } from "@/modules/offers/types";

/** The phone banner: a compact rounded card with the live feed peeking in from the corner, then two small info cards. */
export function MobileHero({ offers }: { offers: OfferListItem[] }) {
  return (
    <section className="px-4 pt-4">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(120deg,#efeaff_0%,#dccfff_60%,#c8b8ff_100%)]">
        <HeroRings className="top-[-30%] -right-[35%] w-[300px]" />
        <div className="relative z-10 w-[62%] py-5 pl-5">
          <h1 className="font-display text-foreground text-[1.65rem] leading-[1.08] font-extrabold tracking-tight">
            Dubai&apos;s IT stock, <span className="text-primary">live.</span>
          </h1>
          <p className="text-foreground/70 mt-2 text-xs leading-4">
            Search verified supplier offers and message the seller.
          </p>
          <Link
            href="/feed"
            className="font-display mt-4 inline-flex h-11 items-center gap-3 rounded-full bg-[#1d1540] py-1.5 pr-1.5 pl-5 text-[13px] font-bold text-white"
          >
            View live market
            <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#1d1540]">
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </Link>
        </div>
        <div className="pointer-events-none absolute top-5 right-[-34px] w-[150px] rotate-[8deg]">
          <PhoneFeed offers={offers} className="h-[210px] overflow-hidden" />
        </div>
        <div className="pointer-events-none absolute top-2 right-[96px]">
          <SouqFeedAgent
            state="waving"
            size="sm"
            alt=""
            className="signal-float drop-shadow-[0_8px_8px_rgba(72,34,182,0.25)]"
          />
        </div>
        <div className="h-[26px]" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <GlassCard className="bg-[linear-gradient(135deg,#f4f0ff,#ece4ff)] p-3.5">
          <Sparkles className="text-primary size-5" aria-hidden />
          <p className="mt-2 text-[13px] leading-4 font-semibold text-[#21184e]">
            WhatsApp stock, made searchable
          </p>
        </GlassCard>
        <SignupDialog
          trigger={
            <button
              type="button"
              className="rounded-3xl border border-white/80 bg-[linear-gradient(135deg,#e5f6ff,#e8e2ff)] p-3.5 text-left shadow-[0_10px_30px_rgba(71,42,170,0.12)]"
            >
              <Package className="text-primary size-5" aria-hidden />
              <p className="mt-2 text-[13px] leading-4 font-semibold text-[#21184e]">
                Supplier? List your stock
              </p>
            </button>
          }
        />
      </div>
    </section>
  );
}
