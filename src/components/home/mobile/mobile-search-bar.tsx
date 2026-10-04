"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Check, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category } from "@/modules/categories/types";
import type { Brand } from "@/modules/brands/types";

const LOCATIONS = ["Bur Dubai", "Deira", "Al Fahidi", "Al Rigga", "Other"];
const QUICK_SEARCHES = ["iPhone 15", "RTX 4090", "Lenovo E14"];

export function MobileSearchBar({
  categories,
  brands,
  trigger,
  inline = false,
}: {
  categories: Category[];
  brands: Brand[];
  trigger?: ReactElement;
  inline?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [inStock, setInStock] = useState(false);
  const activeCount = [
    query,
    brand,
    category,
    location,
    inStock ? "stock" : "",
  ].filter(Boolean).length;
  function apply() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (brand) params.set("brand", brand);
    if (category) params.set("category", category);
    if (location) params.set("location", location);
    if (inStock) params.set("inStock", "true");
    router.push(`/feed${params.toString() ? `?${params}` : ""}`);
  }
  function pill(active: boolean) {
    return active ? "bg-primary text-white" : "bg-[#f5f4fb] text-slate-700";
  }

  return (
    <div className={inline ? "flex flex-1" : "px-4 pt-3"}>
      <Sheet>
        <SheetTrigger
          render={
            trigger ?? (
              <Button
                variant="outline"
                className="h-12 w-full justify-between rounded-xl border-[#ddd5ff] bg-white px-3 shadow-sm"
              >
                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Search className="size-4" />
                  Search model, SKU or keyword...
                </span>
                <span className="text-primary flex items-center gap-1 text-xs font-semibold">
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                  {activeCount > 0 && (
                    <Badge className="size-5 justify-center rounded-full p-0 text-[10px]">
                      {activeCount}
                    </Badge>
                  )}
                </span>
              </Button>
            )
          }
        />
        <SheetContent
          side="bottom"
          className="h-[100dvh] max-h-[100dvh] rounded-none px-0"
        >
          <SheetHeader className="border-b border-[#ebe6ff] px-5 pb-4">
            <SheetTitle className="text-center">
              Search &amp; Filters
            </SheetTitle>
            <button
              type="button"
              className="text-primary absolute top-5 right-5 text-xs font-medium"
              onClick={() => {
                setQuery("");
                setBrand("");
                setCategory("");
                setLocation("");
                setInStock(false);
              }}
            >
              Reset
            </button>
          </SheetHeader>
          <div className="overflow-y-auto px-5 py-4">
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search model, SKU or keyword..."
              className="h-11 rounded-xl"
            />
            <div className="mt-3 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {QUICK_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-full bg-[#f5f4fb] px-4 py-2 text-xs whitespace-nowrap"
                >
                  {term}
                </button>
              ))}
            </div>
            <FilterGroup
              title="Brand"
              items={brands.map((item) => [item.id, item.name] as const)}
              value={brand}
              onChange={setBrand}
            />
            <FilterGroup
              title="Category"
              items={categories
                .slice(0, 8)
                .map((item) => [item.id, item.name] as const)}
              value={category}
              onChange={setCategory}
              outlined
            />
            <div className="mt-6">
              <p className="text-sm font-bold">Location (UAE)</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setLocation("")}
                  className={`rounded-full border px-3 py-2 text-xs ${!location ? "border-primary text-primary" : "border-transparent bg-[#f5f4fb]"}`}
                >
                  <MapPin className="mr-1 inline size-3" />
                  All Locations
                </button>
                {LOCATIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLocation(location === item ? "" : item)}
                    className={`rounded-full px-3 py-2 text-xs ${pill(location === item)}`}
                  >
                    <MapPin className="mr-1 inline size-3" />
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm font-bold">Availability</p>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={inStock}
                  onCheckedChange={(checked) => setInStock(checked === true)}
                />
                In Stock Only
                <Check className="text-live size-4" />
              </label>
            </div>
            <div className="mt-6">
              <p className="text-sm font-bold">Price Range (AED)</p>
              <div className="bg-primary/15 mt-4 h-1.5 rounded-full">
                <div className="bg-primary relative h-full w-3/5 rounded-full">
                  <span className="bg-primary absolute -top-1.5 -left-1 size-4 rounded-full ring-4 ring-[#eeeaff]" />
                  <span className="bg-primary absolute -top-1.5 -right-1 size-4 rounded-full ring-4 ring-[#eeeaff]" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <div className="border-border flex-1 rounded-xl border px-3 py-3">
                  AED 0
                </div>
                <span>to</span>
                <div className="border-border flex-1 rounded-xl border px-3 py-3">
                  AED 50,000+
                </div>
              </div>
            </div>
          </div>
          <div className="mt-auto border-t border-[#ebe6ff] bg-white px-5 py-4">
            <Button className="h-12 w-full rounded-xl" onClick={apply}>
              Show 2,847 Offers <Search className="ml-1 size-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterGroup({
  title,
  items,
  value,
  onChange,
  outlined = false,
}: {
  title: string;
  items: readonly (readonly [string, string])[];
  value: string;
  onChange: (value: string) => void;
  outlined?: boolean;
}) {
  return (
    <div className="mt-6">
      <p className="text-sm font-bold">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(value === id ? "" : id)}
            className={`rounded-full px-4 py-2 text-xs font-medium ${value === id ? "bg-primary text-white" : outlined ? "border border-transparent bg-[#f5f4fb]" : "bg-[#f5f4fb] text-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
