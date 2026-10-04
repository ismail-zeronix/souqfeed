"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignupDialog } from "@/components/layout/signup-dialog";
import type { Category } from "@/modules/categories/types";
import type { MarketStats } from "@/modules/offers/types";

const POPULAR_SEARCHES = ["iPhone 15", "RTX 4090", "Lenovo ThinkPad", "Dell OptiPlex", "HP 250 G10"];

export function HomeHero({ stats: _stats, categories: _categories }: { stats: MarketStats; categories: Category[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(query.trim() ? `/feed?q=${encodeURIComponent(query.trim())}` : "/feed");
  }

  return (
    <section className="relative overflow-hidden border-b border-[#ebe6ff] bg-[#f4f1ff]">
      <div className="absolute inset-y-0 right-0 hidden w-[48%] lg:block">
        <Image src="/images/hero-dubai-creek.jpg" alt="" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f4f1ff] via-[#f4f1ff]/60 to-transparent" />
        <div className="absolute inset-0 bg-[#6c42f5]/10" />
      </div>
      <div className="pointer-events-none absolute right-[19%] bottom-20 hidden size-40 rounded-full bg-[#8b5cf6]/20 blur-3xl lg:block" />
      <div className="relative mx-auto min-h-[430px] max-w-[1440px] px-6 pt-10 pb-12 lg:pt-12 lg:pb-16">
        <div className="max-w-2xl">
          <p className="text-primary text-xs font-bold tracking-[0.18em] uppercase">Live IT trading floor for UAE</p>
          <h1 className="text-foreground mt-3 max-w-xl text-4xl leading-[1.05] font-bold tracking-tight lg:text-6xl">Real Suppliers. Live Stock.<span className="text-primary block">Faster Deals.</span></h1>
          <p className="text-muted-foreground mt-4 max-w-lg text-sm leading-6 lg:text-base">Search, compare and connect with verified IT suppliers in the UAE. Turn WhatsApp chaos into a structured, searchable market.</p>
          <form onSubmit={handleSearchSubmit} className="mt-6 flex max-w-2xl gap-2">
            <div className="relative flex-1"><Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search model, SKU, part number, specification..." className="h-12 border-[#ddd5ff] bg-white pl-10 shadow-[0_10px_35px_rgba(71,42,170,0.08)] placeholder:text-[#9a92b8] focus-visible:border-primary" /></div>
            <Button type="submit" size="lg" className="h-12 px-6"><Search className="size-4" aria-hidden /></Button>
          </form>
          <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"><span className="font-semibold">Popular:</span>{POPULAR_SEARCHES.map((term) => <button key={term} type="button" onClick={() => setQuery(term)} className="hover:text-primary transition-colors">{term}</button>)}</div>
          <div className="mt-5 flex flex-wrap gap-3"><Button nativeButton={false} render={<Link href="/feed" />} className="bg-primary hover:bg-primary/90">View Live Market <ArrowRight className="ml-1 size-4" aria-hidden /></Button><SignupDialog trigger={<Button variant="outline" className="border-[#cfc4ff] bg-white text-primary hover:bg-[#f1edff]"><Package className="mr-1 size-4" aria-hidden />List your stock</Button>} /></div>
          <div className="text-muted-foreground mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium"><span>◉ Live supplier stock from Dubai</span><span>✓ Verified & trusted suppliers</span><span>▥ Real market prices</span></div>
        </div>
        <div className="absolute right-[13%] bottom-16 hidden items-end gap-4 lg:flex"><div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#21184e] shadow-[0_10px_30px_rgba(48,25,122,0.12)]">Smarter sourcing<br /><span className="text-primary">starts here</span></div><Image src="/brand/mascot-animated.svg" alt="SouqFeed mascot" width={150} height={150} className="drop-shadow-[0_16px_16px_rgba(72,34,182,0.24)]" /></div>
      </div>
    </section>
  );
}
