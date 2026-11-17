"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { cn } from "cn";
import type { Brand } from "@/modules/brands/types";
import type { Category } from "@/modules/categories/types";
import type { SearchFilters } from "@/modules/search/params";
import type { SearchFacets } from "@/modules/search/queries";

function Field({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`filter-${name}`}>{label}</Label>
      <NativeSelect id={`filter-${name}`} name={name} defaultValue={value}>
        {children}
      </NativeSelect>
    </div>
  );
}

/** Leaves unset filters out of the URL, so shared links stay short. */
function dropEmptyFields(event: FormEvent<HTMLFormElement>) {
  for (const element of Array.from(event.currentTarget.elements)) {
    if (
      (element instanceof HTMLSelectElement ||
        element instanceof HTMLInputElement) &&
      element.value === ""
    ) {
      element.disabled = true;
    }
  }
}

function activeFilterCount(filters: SearchFilters): number {
  return [
    filters.brandId,
    filters.categoryId,
    filters.supplierSlug,
    filters.location,
    filters.price,
    filters.availableOnly || null,
    filters.fresh,
  ].filter(Boolean).length;
}

/**
 * A plain GET form, so every filtered search is a shareable URL. On small
 * screens it folds behind a button so results come first.
 */
export function SearchFiltersForm({
  filters,
  brands,
  categories,
  facets,
}: {
  filters: SearchFilters;
  brands: Brand[];
  categories: (Category & { depth: number })[];
  facets: SearchFacets;
}) {
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(filters);

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="w-full lg:hidden"
        aria-expanded={open}
        aria-controls="search-filters"
        onClick={() => setOpen((value) => !value)}
      >
        <SlidersHorizontal className="size-4" />
        {open ? "Hide filters" : "Filters"}
        {active > 0 && ` · ${active} active`}
      </Button>
      <form
        id="search-filters"
        method="get"
        action="/search"
        onSubmit={dropEmptyFields}
        className={cn(
          "bg-card mt-3 flex-col gap-4 rounded-xl border p-4 lg:mt-0 lg:flex",
          open ? "flex" : "hidden",
        )}
        aria-label="Search filters"
      >
        {filters.query && (
          <input type="hidden" name="q" value={filters.query} />
        )}
        <Field label="Brand" name="brand" value={filters.brandId ?? ""}>
          <option value="">Any brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </Field>
        <Field
          label="Category"
          name="category"
          value={filters.categoryId ?? ""}
        >
          <option value="">Any category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {"  ".repeat(category.depth)}
              {category.name}
            </option>
          ))}
        </Field>
        <Field
          label="Supplier"
          name="supplier"
          value={filters.supplierSlug ?? ""}
        >
          <option value="">Any supplier</option>
          {facets.suppliers.map((supplier) => (
            <option key={supplier.slug} value={supplier.slug}>
              {supplier.name}
            </option>
          ))}
        </Field>
        <Field label="Location" name="location" value={filters.location ?? ""}>
          <option value="">Anywhere</option>
          {facets.locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </Field>
        <Field label="Price" name="price" value={filters.price ?? ""}>
          <option value="">Any</option>
          <option value="fixed">Has a price</option>
          <option value="ask">Ask for price</option>
        </Field>
        <Field
          label="Availability"
          name="availability"
          value={filters.availableOnly ? "available" : ""}
        >
          <option value="">Any</option>
          <option value="available">Quantity stated</option>
        </Field>
        <Field label="Updated" name="fresh" value={filters.fresh ?? ""}>
          <option value="">Any time</option>
          <option value="1h">Last hour</option>
          <option value="24h">Today</option>
          <option value="3d">Last 3 days</option>
          <option value="7d">Last 7 days</option>
        </Field>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Apply
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                href={
                  filters.query
                    ? `/search?q=${encodeURIComponent(filters.query)}`
                    : "/search"
                }
              />
            }
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}
