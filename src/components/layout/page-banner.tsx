import type { ReactNode } from "react";
import { HeroRings } from "@/components/home/hero-art";
import {
  SouqFeedAgent,
  type SouqFeedAgentState,
} from "@/components/ui/souqfeed-agent";

/** The rounded gradient heading card used at the top of the public list pages. */
export function PageBanner({
  eyebrow,
  title,
  description,
  mascot = "idle",
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  mascot?: SouqFeedAgentState;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(120deg,#efeaff_0%,#dccfff_60%,#c8b8ff_100%)] px-5 py-6 md:rounded-[2rem] md:px-10 md:py-9">
      <HeroRings className="top-1/2 -right-16 hidden w-[380px] -translate-y-1/2 md:block" />
      <div className="relative z-10 max-w-xl pr-16 md:pr-0">
        <p className="text-primary text-xs font-bold tracking-[0.16em] uppercase">
          {eyebrow}
        </p>
        <h1 className="font-display text-foreground mt-1.5 text-2xl leading-tight font-extrabold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="text-foreground/70 mt-2 text-sm leading-5 md:text-base md:leading-6">
          {description}
        </p>
        {children && <div className="mt-4">{children}</div>}
      </div>
      <SouqFeedAgent
        state={mascot}
        size="xl"
        alt=""
        className="absolute right-2 bottom-0 size-20 drop-shadow-[0_12px_14px_rgba(72,34,182,0.25)] md:right-14 md:size-48"
      />
    </div>
  );
}
