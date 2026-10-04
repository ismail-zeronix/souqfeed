"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Mail,
  MessageCircle,
  Package,
  Phone,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignupDialog } from "@/components/layout/signup-dialog";
import type { Category } from "@/modules/categories/types";
import type { MarketStats } from "@/modules/offers/types";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";

const HERO_PHRASES = ["Buyers find stock.", "Suppliers find buyers."];

export function HomeHero({}: { stats: MarketStats; categories: Category[] }) {
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
      isComplete ? 1800 : 70,
    );

    return () => window.clearTimeout(timer);
  }, [phraseIndex, typedLine]);

  return (
    <section className="relative overflow-hidden border-b border-[#e7e0ff] bg-[#f7f5ff]">
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(108,66,245,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(108,66,245,0.06)_1px,transparent_1px)] [background-size:42px_42px] opacity-50" />
      <div className="pointer-events-none absolute -top-24 right-[16%] size-72 rounded-full bg-[#cfc3ff]/45 blur-3xl" />
      <div className="relative mx-auto max-w-[1180px] px-5 py-6 lg:flex lg:min-h-[300px] lg:items-center lg:justify-between lg:gap-10 lg:py-7">
        <div className="max-w-[680px]">
          <div className="text-primary inline-flex items-center gap-2 rounded-full border border-[#d7ccff] bg-white/75 px-3 py-1 text-[11px] font-bold tracking-[0.16em] uppercase shadow-sm">
            <span className="bg-live size-1.5 rounded-full" />
            Live UAE supplier feed
          </div>
          <h1 className="text-foreground mt-3 max-w-xl text-3xl leading-[1.05] font-bold tracking-tight lg:text-5xl">
            Still searching or broadcasting on WhatsApp?
            <span className="text-primary mt-2 block min-h-[1.05em]">
              {typedLine}
              <span className="text-primary/50 ml-1 inline-block animate-pulse">
                |
              </span>
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-lg text-sm leading-5 lg:text-[15px]">
            Search verified IT stock across Dubai&apos;s wholesale market and
            find the right supplier before the next message lands.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button
              nativeButton={false}
              render={<Link href="/feed" />}
              className="bg-primary hover:bg-primary/90"
            >
              View Live Market{" "}
              <ArrowRight className="ml-1 size-4" aria-hidden />
            </Button>
            <SignupDialog
              trigger={
                <Button
                  variant="outline"
                  className="text-primary border-[#cfc4ff] bg-white hover:bg-[#f1edff]"
                >
                  <Package className="mr-1 size-4" aria-hidden />
                  List your stock
                </Button>
              }
            />
          </div>
          <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Check className="text-live size-3.5" />
              Verified suppliers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="text-primary size-3.5" />
              Real market prices
            </span>
          </div>
        </div>
        <div className="relative mt-6 hidden w-[275px] shrink-0 lg:block">
          <div className="signal-float absolute -top-5 left-2 z-20 flex items-center gap-1.5 rounded-full border border-[#ddd5ff] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#7e7699] shadow-[0_8px_18px_rgba(71,42,170,0.12)]">
            <MessageCircle className="size-3.5 text-[#25d366]" /> WhatsApp
          </div>
          <div className="signal-float absolute top-9 -right-7 z-20 flex items-center gap-1.5 rounded-full border border-[#ddd5ff] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#7e7699] shadow-[0_8px_18px_rgba(71,42,170,0.12)] [animation-delay:700ms]">
            <Mail className="text-primary size-3.5" /> Email
          </div>
          <div className="signal-float absolute bottom-7 -left-9 z-20 flex items-center gap-1.5 rounded-full border border-[#ddd5ff] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#7e7699] shadow-[0_8px_18px_rgba(71,42,170,0.12)] [animation-delay:1400ms]">
            <Phone className="size-3.5 text-[#2a8fdb]" /> Calls
          </div>
          <div className="relative z-10 rounded-[1.5rem] border border-[#ddd5ff] bg-white/85 p-4 shadow-[0_18px_45px_rgba(71,42,170,0.14)] backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-[#5f5581]">
              <span>SouqFeed signal</span>
              <span className="text-live">+12.4%</span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-[#21184e]">One signal</p>
                <p className="mt-1 text-xs text-[#7e7699]">
                  Less noise. Better connections.
                </p>
              </div>
              <SouqFeedAgent
                state="searching"
                size="md"
                alt="SouqFeed mascot searching"
                className="drop-shadow-[0_16px_16px_rgba(72,34,182,0.22)]"
              />
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eeeaff]">
              <div className="bg-primary h-full w-4/5 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex justify-center lg:hidden">
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
