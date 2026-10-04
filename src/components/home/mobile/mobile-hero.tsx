"use client";

import { useEffect, useState } from "react";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";

const HERO_PHRASES = ["Buyers find stock.", "Suppliers find buyers."];

export function MobileHero() {
  const [typedLine, setTypedLine] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const phrase = HERO_PHRASES[phraseIndex];
    const isComplete = typedLine === phrase;
    const timer = window.setTimeout(
      () => {
        if (isComplete) {
          setPhraseIndex((current) => (current + 1) % HERO_PHRASES.length);
          setTypedLine("");
        } else {
          setTypedLine(phrase.slice(0, typedLine.length + 1));
        }
      },
      isComplete ? 1800 : 65,
    );

    return () => window.clearTimeout(timer);
  }, [phraseIndex, typedLine]);

  return (
    <section className="px-4 pt-6 pb-3">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
        Live UAE supplier feed
      </p>
      <div className="mt-2 flex items-start gap-2">
        <h1 className="text-foreground font-heading min-w-0 flex-1 text-[27px] leading-[1.08] font-bold tracking-tight">
          Still searching or broadcasting on WhatsApp?
          <span className="text-primary mt-2 block min-h-[1.08em]">
            {typedLine}
            <span className="text-primary/50 ml-0.5 animate-pulse">|</span>
          </span>
        </h1>
        <div className="mt-1 shrink-0">
          <SouqFeedAgent
            state="searching"
            size="md"
            alt="SouqFeed mascot searching"
          />
        </div>
      </div>
    </section>
  );
}
