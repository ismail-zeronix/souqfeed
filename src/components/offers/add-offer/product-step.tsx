"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, PackagePlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchCatalogAction } from "@/modules/broadcasts/manual/actions";
import type { CatalogProduct } from "@/modules/broadcasts/manual/queries";
import { specLabel, type SpecField } from "@/modules/categories/spec-templates";

function specSummary(specs: Record<string, string>): string[] {
  return Object.values(specs).slice(0, 4);
}

/** Search a brand's catalog products and choose one. */
export function CatalogSearch({
  brandId,
  categoryId,
  onChoose,
  onDescribe,
}: {
  brandId: string;
  categoryId: string | null;
  onChoose: (product: CatalogProduct) => void;
  onDescribe: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    key: string;
    rows: CatalogProduct[];
  } | null>(null);
  const key = `${brandId}|${categoryId}|${query.trim()}`;

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(
      () => {
        searchCatalogAction(brandId, categoryId, query).then((rows) => {
          if (!cancelled) setResults({ key, rows });
        });
      },
      query.trim() ? 250 : 0,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [brandId, categoryId, query, key]);

  const rows = results?.rows ?? [];
  const loading = results?.key !== key;

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search
          className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by model or part number, e.g. E14 Gen 5, 21JK0083AD"
          aria-label="Search the catalog"
          className="h-10 pl-9"
        />
      </div>
      <p className="text-muted-foreground text-xs" aria-live="polite">
        {loading
          ? "Searching…"
          : query.trim()
            ? `${rows.length} ${rows.length === 1 ? "match" : "matches"} in the catalog`
            : rows.length > 0
              ? "Popular in the catalog"
              : "No products of this brand in the catalog yet."}
      </p>
      {rows.length > 0 && (
        <ul className="grid gap-2">
          {rows.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => onChoose(product)}
                className="hover:border-primary hover:bg-primary/5 focus-visible:ring-ring/50 w-full rounded-lg border px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-3"
              >
                <span className="block text-sm font-medium">
                  {product.title}
                </span>
                <span className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-2 text-xs">
                  {product.partNumber && (
                    <span className="font-mono">{product.partNumber}</span>
                  )}
                  {product.categoryName && <span>{product.categoryName}</span>}
                  {specSummary(product.specifications).map((spec) => (
                    <span key={spec}>· {spec}</span>
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={onDescribe}
        className="text-muted-foreground hover:text-foreground hover:border-primary flex items-center gap-3 rounded-lg border border-dashed px-3 py-3 text-left text-sm transition-colors"
      >
        <PackagePlus className="text-primary size-5 shrink-0" aria-hidden />
        <span>
          <span className="text-foreground block font-medium">
            Can&apos;t find it? Describe the product
          </span>
          SouqFeed adds it to the catalog, then your offer goes live.
        </span>
      </button>
    </div>
  );
}

/** Model, part number, and the category's spec fields for a new product. */
export function DescribeProduct({
  template,
  defaults,
  errors,
  onBack,
}: {
  template: SpecField[];
  defaults: Record<string, string>;
  errors: Record<string, string>;
  onBack: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-1.5">
          <Label htmlFor="model">
            Model <span aria-hidden>*</span>
          </Label>
          <Input
            id="model"
            name="model"
            autoComplete="off"
            maxLength={120}
            placeholder="e.g. ThinkPad E14 Gen 5"
            defaultValue={defaults.model ?? ""}
            aria-invalid={Boolean(errors.model)}
            aria-describedby="model-error"
            className="h-9"
          />
          <FieldError id="model-error" message={errors.model} />
        </div>
        <div className="grid content-start gap-1.5">
          <Label htmlFor="partNumber">Part number</Label>
          <Input
            id="partNumber"
            name="partNumber"
            autoComplete="off"
            maxLength={80}
            placeholder="e.g. 21JK0083AD"
            defaultValue={defaults.partNumber ?? ""}
            aria-invalid={Boolean(errors.partNumber)}
            aria-describedby="partNumber-error"
            className="h-9 font-mono"
          />
          <FieldError id="partNumber-error" message={errors.partNumber} />
        </div>
        {template.map((field) => {
          const name = `spec_${field.key}`;
          return (
            <div key={field.key} className="grid content-start gap-1.5">
              <Label htmlFor={name}>{field.label}</Label>
              <Input
                id={name}
                name={name}
                autoComplete="off"
                maxLength={120}
                placeholder={field.placeholder}
                defaultValue={defaults[name] ?? ""}
                aria-invalid={Boolean(errors[name])}
                aria-describedby={`${name}-error`}
                className="h-9"
              />
              <FieldError id={`${name}-error`} message={errors[name]} />
            </div>
          );
        })}
      </div>
      <p className="text-muted-foreground text-xs">
        Fill in what you know; leave the rest empty. The part number helps
        SouqFeed match it to the right product.
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={onBack}
      >
        <ArrowLeft aria-hidden />
        Back to the catalog
      </Button>
    </div>
  );
}

/** What the chosen catalog product's specs say, for the summary line. */
export function chosenProductSummary(product: CatalogProduct): string {
  const specs = Object.entries(product.specifications)
    .slice(0, 3)
    .map(([key, value]) => `${specLabel(key)} ${value}`);
  return [product.partNumber, ...specs].filter(Boolean).join(" · ");
}
