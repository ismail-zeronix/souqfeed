import Link from "next/link";
import { ArrowRight, MessageCircle, Package, Sparkles } from "lucide-react";
import { SignupDialog } from "@/components/layout/signup-dialog";
import {
  FloatingChip,
  GlassCard,
  HeroRings,
  PhoneFeed,
} from "@/components/home/hero-art";
import type { OfferListItem } from "@/modules/offers/types";

/** The desktop banner: a big rounded card, the headline on the left, the live feed drawn as a phone on the right. */
export function HomeHero({ offers }: { offers: OfferListItem[] }) {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-5 pt-6">
      <div className="relative min-h-[440px] overflow-hidden rounded-[2.25rem] bg-[linear-gradient(115deg,#efeaff_0%,#dfd5ff_52%,#c8b8ff_100%)]">
        <HeroRings className="top-1/2 -right-[6%] w-[640px] -translate-y-1/2" />

        <div className="relative z-10 flex h-full min-h-[440px] flex-col justify-center px-12 py-10 lg:w-[58%]">
          <span className="text-primary inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold">
            <span className="bg-live size-2 rounded-full" />
            Live UAE supplier feed
          </span>
          <h1 className="font-display text-foreground mt-5 text-[3.4rem] leading-[1.02] font-extrabold tracking-tight">
            Dubai&apos;s IT stock,
            <br />
            <span className="text-primary">one live feed.</span>
          </h1>
          <p className="text-foreground/70 mt-4 max-w-md text-base leading-6">
            Stop scrolling WhatsApp groups. Search verified supplier offers by
            model or part number and message the seller directly.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/feed"
              className="font-display inline-flex h-14 items-center gap-4 rounded-full bg-[#1d1540] py-2 pr-2 pl-7 text-[15px] font-bold text-white transition hover:bg-[#2a1f5c]"
            >
              View live market
              <span className="flex size-10 items-center justify-center rounded-full bg-white text-[#1d1540]">
                <ArrowRight className="size-5" aria-hidden />
              </span>
            </Link>
            <SignupDialog
              trigger={
                <button
                  type="button"
                  className="font-display text-primary inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#1d1540]/15 bg-white/60 px-6 text-[15px] font-bold hover:bg-white"
                >
                  <Package className="size-4" aria-hidden />
                  List your stock
                </button>
              }
            />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] lg:block">
          <FloatingChip
            index={0}
            className="top-14 left-[-4%] size-16 -rotate-6"
          />
          <FloatingChip
            index={1}
            className="top-[46%] left-[-12%] size-14 rotate-6"
          />
          <FloatingChip
            index={2}
            className="bottom-14 left-[2%] size-14 -rotate-3"
          />
          <PhoneFeed
            offers={offers}
            className="absolute top-12 left-[12%] w-[250px] rotate-[7deg]"
          />
          <FloatingChip
            index={3}
            className="top-10 right-[30%] size-14 rotate-3"
          />
        </div>

        <div className="absolute right-6 bottom-6 z-20 hidden w-[230px] space-y-3 xl:block">
          <GlassCard className="flex items-start gap-3 p-4">
            <Sparkles className="text-primary mt-0.5 size-5 shrink-0" />
            <p className="text-[13px] leading-5 font-semibold text-[#21184e]">
              WhatsApp broadcasts, turned into searchable offers.
            </p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="flex items-center gap-2 text-[13px] font-bold text-[#21184e]">
              <MessageCircle className="size-4 text-[#25d366]" />
              Chat before you buy
            </p>
            <p className="mt-1 text-xs text-[#6b6390]">
              Every offer has a live chat with our sales team.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
