"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Package, Search, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatTile } from "@/components/ui/stat-tile";
import { SignupDialog } from "@/components/layout/signup-dialog";
import type { Category } from "@/modules/categories/types";
import type { MarketStats } from "@/modules/offers/types";

export function HomeHero({
  stats,
  categories,
}: {
  stats: MarketStats;
  categories: Category[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (categoryId) params.set("category", categoryId);
    const qs = params.toString();
    router.push(qs ? `/feed?${qs}` : "/feed");
  }

  return (
    <section id="home-hero" className="relative -mt-16 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-dubai-creek.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#06281C]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06281C] via-[#06281C]/60 to-[#06281C]/30" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 pt-32 pb-12">
        <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
          Live supplier offers from <span className="text-white">Dubai</span>
        </p>
        <h1 className="mt-2 max-w-2xl text-4xl font-bold text-white lg:text-5xl">
          Stop searching hundreds of WhatsApp messages.
        </h1>
        <p className="mt-1 text-xl font-semibold text-white/90 lg:text-2xl">
          Search the Dubai IT market instead.
        </p>
        <p className="mt-3 max-w-xl text-sm text-white/70">
          SouqFeed turns suppliers&apos; WhatsApp stock broadcasts into
          structured, searchable offers. Real-time offers. Verified suppliers.
          Better sourcing.
        </p>

        <form
          onSubmit={handleSearchSubmit}
          className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/50"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search model, SKU, part number, specification..."
              className="h-11 border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/50 focus-visible:border-white/50"
            />
          </div>
          <Select
            value={categoryId ?? "all"}
            onValueChange={(value) =>
              setCategoryId(value === "all" ? null : String(value))
            }
          >
            <SelectTrigger className="h-11 border-white/20 bg-white/10 text-white sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="lg" className="h-11">
            Search
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/feed" />}
            className="bg-white text-[#0F6B45] hover:bg-white/90"
          >
            View Live Market
          </Button>
          <SignupDialog
            trigger={
              <Button
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Package className="mr-1 size-4" aria-hidden />
                List your stock
              </Button>
            }
          />
        </div>

        <div className="relative z-10 mt-8 grid max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            icon={
              <Users className="text-muted-foreground size-5" aria-hidden />
            }
            value={stats.activeSuppliersToday.toLocaleString()}
            animateFrom={stats.activeSuppliersToday}
            label="Active Suppliers Today"
            trendPercent={stats.activeSuppliersTrendPercent}
            className="shadow-lg shadow-black/20"
          />
          <StatTile
            icon={
              <FileText className="text-muted-foreground size-5" aria-hidden />
            }
            value={stats.offersPostedToday.toLocaleString()}
            animateFrom={stats.offersPostedToday}
            label="Offers Posted Today"
            trendPercent={stats.offersPostedTrendPercent}
            className="shadow-lg shadow-black/20"
          />
          <StatTile
            icon={
              <TrendingUp
                className="text-muted-foreground size-5"
                aria-hidden
              />
            }
            value={stats.priceUpdatesToday.toLocaleString()}
            animateFrom={stats.priceUpdatesToday}
            label="Price Updates"
            trendPercent={stats.priceUpdatesTrendPercent}
            className="shadow-lg shadow-black/20"
          />
          <StatTile
            icon={
              <Package className="text-muted-foreground size-5" aria-hidden />
            }
            value={stats.newProductsToday.toLocaleString()}
            animateFrom={stats.newProductsToday}
            label="New Products"
            trendPercent={stats.newProductsTrendPercent}
            className="shadow-lg shadow-black/20"
          />
        </div>
      </div>

      <a
        href="https://commons.wikimedia.org/wiki/File:Dubai_Creek.jpg"
        target="_blank"
        rel="noreferrer"
        className="absolute right-2 bottom-1 text-[10px] text-white/40 hover:text-white/70"
      >
        Photo: Senemm, CC BY-SA 3.0
      </a>
    </section>
  );
}
