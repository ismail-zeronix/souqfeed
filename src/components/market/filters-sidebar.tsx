"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Brand } from "@/modules/brands/types";
import type { Category } from "@/modules/categories/types";
import type { OfferFilterCriteria } from "@/modules/offers/types";

export interface FiltersSidebarProps {
  brands: Brand[];
  categories: Category[];
  locationNames: string[];
  criteria: OfferFilterCriteria;
  onCriteriaChange: (criteria: OfferFilterCriteria) => void;
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}

function FilterControls({
  brands,
  categories,
  locationNames,
  criteria,
  onCriteriaChange,
}: FiltersSidebarProps) {
  return (
    <div className="border-border bg-card flex flex-col gap-5 rounded-xl border p-4 shadow-[0_2px_10px_rgba(34,22,80,0.04)]">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-base font-bold">Filters</h2>
        <button
          type="button"
          className="text-primary text-xs font-medium hover:underline"
          onClick={() =>
            onCriteriaChange({
              brandIds: [],
              categoryIds: [],
              locationNames: [],
              inStockOnly: false,
              searchQuery: criteria.searchQuery,
            })
          }
        >
          Clear all
        </button>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-foreground mb-1 flex w-full items-center justify-between text-xs font-bold">
          Category <span className="text-muted-foreground">⌃</span>
        </legend>
        {categories.map((category) => (
          <Label key={category.id} className="justify-between text-xs font-normal">
            <span className="flex items-center gap-2">
            <Checkbox
              checked={criteria.categoryIds.includes(category.id)}
              onCheckedChange={() =>
                onCriteriaChange({
                  ...criteria,
                  categoryIds: toggleValue(criteria.categoryIds, category.id),
                })
              }
            />
            {category.name}
            </span>
            <span className="text-muted-foreground text-[11px] tabular-nums">{category.offerCount}</span>
          </Label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-foreground mb-1 flex w-full items-center justify-between text-xs font-bold">
          Brand <span className="text-muted-foreground">⌃</span>
        </legend>
        {brands.map((brand) => (
          <Label key={brand.id} className="justify-between text-xs font-normal">
            <span className="flex items-center gap-2">
              <Checkbox
                checked={criteria.brandIds.includes(brand.id)}
                onCheckedChange={() =>
                  onCriteriaChange({
                    ...criteria,
                    brandIds: toggleValue(criteria.brandIds, brand.id),
                  })
                }
              />
              {brand.name}
            </span>
          </Label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-foreground mb-1 flex w-full items-center justify-between text-xs font-bold">
          Location (UAE) <span className="text-muted-foreground">⌃</span>
        </legend>
        {locationNames.map((location) => (
          <Label key={location} className="text-xs font-normal">
            <Checkbox
              checked={criteria.locationNames.includes(location)}
              onCheckedChange={() =>
                onCriteriaChange({
                  ...criteria,
                  locationNames: toggleValue(criteria.locationNames, location),
                })
              }
            />
            {location}
          </Label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-foreground mb-1 flex w-full items-center justify-between text-xs font-bold">
          Availability <span className="text-muted-foreground">⌃</span>
        </legend>
        <Label className="text-xs font-normal">
          <Checkbox
            checked={criteria.inStockOnly}
            onCheckedChange={(checked) =>
              onCriteriaChange({ ...criteria, inStockOnly: checked })
            }
          />
          In Stock only
        </Label>
      </fieldset>
    </div>
  );
}

export function FiltersSidebar(props: FiltersSidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">
        <FilterControls {...props} />
      </aside>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-1 size-4" aria-hidden />
                Filters
              </Button>
            }
          />
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">
              <FilterControls {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
