"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

function FilterControls({ brands, categories, locationNames, criteria, onCriteriaChange }: FiltersSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        <button
          type="button"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
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
        <legend className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Brand</legend>
        {brands.map((brand) => (
          <Label key={brand.id} className="font-normal">
            <Checkbox
              checked={criteria.brandIds.includes(brand.id)}
              onCheckedChange={() =>
                onCriteriaChange({ ...criteria, brandIds: toggleValue(criteria.brandIds, brand.id) })
              }
            />
            {brand.name}
          </Label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Category</legend>
        {categories.map((category) => (
          <Label key={category.id} className="justify-between font-normal">
            <span className="flex items-center gap-2">
              <Checkbox
                checked={criteria.categoryIds.includes(category.id)}
                onCheckedChange={() =>
                  onCriteriaChange({ ...criteria, categoryIds: toggleValue(criteria.categoryIds, category.id) })
                }
              />
              {category.name}
            </span>
            <span className="tabular-nums text-xs text-muted-foreground">{category.offerCount}</span>
          </Label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Location</legend>
        {locationNames.map((location) => (
          <Label key={location} className="font-normal">
            <Checkbox
              checked={criteria.locationNames.includes(location)}
              onCheckedChange={() =>
                onCriteriaChange({ ...criteria, locationNames: toggleValue(criteria.locationNames, location) })
              }
            />
            {location}
          </Label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Availability</legend>
        <Label className="font-normal">
          <Checkbox
            checked={criteria.inStockOnly}
            onCheckedChange={(checked) => onCriteriaChange({ ...criteria, inStockOnly: checked })}
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
