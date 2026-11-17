import { Check, MessageCircle } from "lucide-react";
import { HeroRings } from "@/components/home/hero-art";
import { SignupDialog } from "@/components/layout/signup-dialog";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";

const POINTS = [
  "Paste your WhatsApp stock list, or add items one by one",
  "We match each line to the right product",
  "Buyers message you straight on WhatsApp",
];

export function SupplierCta() {
  return (
    <section className="mx-auto my-10 w-full max-w-[1240px] px-4 md:px-5">
      <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#1d1540,#33208a_70%,#4b2fc7)] px-6 py-9 text-white md:px-12 md:py-12">
        <HeroRings className="top-1/2 -right-24 hidden w-[420px] -translate-y-1/2 opacity-15 md:block" />
        <div className="relative z-10 max-w-xl">
          <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-4xl">
            Already broadcasting stock on WhatsApp?
          </h2>
          <ul className="mt-5 space-y-2.5">
            {POINTS.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2.5 text-sm text-white/85 md:text-base"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-[#06361a]">
                  <Check className="size-3.5" aria-hidden />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <SignupDialog
            trigger={
              <button
                type="button"
                className="font-display mt-7 inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-7 text-[15px] font-bold text-[#1d1540] hover:bg-[#efeaff]"
              >
                <MessageCircle className="size-4" aria-hidden />
                Get started
              </button>
            }
          />
        </div>
        <SouqFeedAgent
          state="waving"
          size="xl"
          alt="SouqFeed mascot waving"
          className="absolute right-3 bottom-0 size-24 drop-shadow-[0_16px_18px_rgba(0,0,0,0.3)] md:right-16 md:size-60"
        />
      </div>
    </section>
  );
}
