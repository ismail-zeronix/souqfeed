"use client";

import { FileText, Package, Search, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatTile } from "@/components/ui/stat-tile";
import type { Category } from "@/modules/categories/types";
import type { MarketStats } from "@/modules/offers/types";

export interface MarketHeroProps {
  stats: MarketStats;
  categories: Category[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  categoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export function MarketHero({
  stats,
  categories,
  searchQuery,
  onSearchQueryChange,
  categoryId,
  onCategoryChange,
}: MarketHeroProps) {
  return (
    <section className="border-b border-border bg-primary/5">
      <div className="mx-auto max-w-[1440px] px-6 py-10">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Live supplier offers from <span className="text-primary">Bur Dubai</span>
        </p>
        <h1 className="mt-2 text-4xl font-bold text-foreground">Dubai IT Wholesale Market</h1>
        <p className="mt-1 text-lg text-muted-foreground">Real-time offers. Verified suppliers. Better sourcing.</p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search model, SKU, part number, specification..."
              className="h-11 pl-9"
            />
          </div>
          <Select
            value={categoryId ?? "all"}
            onValueChange={(value) => onCategoryChange(value === "all" ? null : String(value))}
          >
            <SelectTrigger className="h-11 sm:w-48">
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
          <Button size="lg" className="h-11">
            Search
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={Users} value={stats.activeSuppliersToday.toLocaleString()} label="Active Suppliers Today" trendPercent={stats.activeSuppliersTrendPercent} />
          <StatTile icon={FileText} value={stats.offersPostedToday.toLocaleString()} label="Offers Posted Today" trendPercent={stats.offersPostedTrendPercent} />
          <StatTile icon={TrendingUp} value={stats.priceUpdatesToday.toLocaleString()} label="Price Updates" trendPercent={stats.priceUpdatesTrendPercent} />
          <StatTile icon={Package} value={stats.newProductsToday.toLocaleString()} label="New Products" trendPercent={stats.newProductsTrendPercent} />
        </div>
      </div>
    </section>
  );
}
