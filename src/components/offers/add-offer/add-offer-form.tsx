"use client";

import { useActionState, useMemo, useState } from "react";
import { Info, Search, Send } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { FieldError, FormMessage } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  submitManualOfferAction,
  type ManualOfferFormState,
} from "@/modules/broadcasts/manual/actions";
import type {
  AddOfferOptions,
  BrandOption,
  CatalogProduct,
  CategoryOption,
} from "@/modules/broadcasts/manual/queries";
import { specTemplateFor } from "@/modules/categories/spec-templates";
import { CategoryIcon } from "./category-icon";
import {
  EMPTY_DETAILS,
  OfferDetailsFields,
  type OfferDetailsDefaults,
} from "./offer-details-fields";
import {
  CatalogSearch,
  DescribeProduct,
  chosenProductSummary,
} from "./product-step";
import { Step } from "./step";

const INITIAL_STATE: ManualOfferFormState = { status: "idle" };
const SUGGESTED_BRANDS_SHOWN = 24;

type StepNumber = 1 | 2 | 3 | 4;

function findCategory(options: CategoryOption[], id: string | null) {
  if (!id) return { top: null, sub: null };
  for (const top of options) {
    if (top.id === id) return { top, sub: null };
    const sub = top.children.find((child) => child.id === id);
    if (sub) return { top, sub };
  }
  return { top: null, sub: null };
}

function detailsFrom(values: Record<string, string> | undefined) {
  if (!values) return EMPTY_DETAILS;
  return {
    condition: values.condition ?? "",
    priceMode: values.priceMode === "ask" ? "ask" : "fixed",
    price: values.price ?? "",
    currency: values.currency ?? "AED",
    quantity: values.quantity ?? "",
    warranty: values.warranty ?? "",
    notes: values.notes ?? "",
  } satisfies OfferDetailsDefaults;
}

/**
 * Add an offer in four steps: category → brand → catalog product (or describe
 * a new one) → price and details.
 */
export function AddOfferForm({
  options,
  initialCategoryId,
  initialBrandId,
}: {
  options: AddOfferOptions;
  initialCategoryId: string | null;
  initialBrandId: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    submitManualOfferAction,
    INITIAL_STATE,
  );
  const initial = findCategory(options.categories, initialCategoryId);
  const [top, setTop] = useState<CategoryOption | null>(initial.top);
  const [sub, setSub] = useState<CategoryOption["children"][number] | null>(
    initial.sub,
  );
  const [brand, setBrand] = useState<BrandOption | null>(
    () => options.brands.find((item) => item.id === initialBrandId) ?? null,
  );
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [describing, setDescribing] = useState(false);
  const [editing, setEditing] = useState<StepNumber | null>(
    initial.top && !initial.sub && initial.top.children.length > 0 ? 1 : null,
  );
  const [brandFilter, setBrandFilter] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);

  const errors = state.fieldErrors ?? {};
  const categoryId = sub?.id ?? top?.id ?? null;
  const template = specTemplateFor(top?.slug ?? null);

  const current: StepNumber =
    editing ?? (!top ? 1 : !brand ? 2 : !product && !describing ? 3 : 4);

  const suggested = useMemo(
    () =>
      top
        ? options.brands.filter((item) => item.categorySlugs.includes(top.slug))
        : [],
    [options.brands, top],
  );
  const filter = brandFilter.trim().toLowerCase();
  const brandList = filter
    ? options.brands.filter((item) => item.name.toLowerCase().includes(filter))
    : showAllBrands || suggested.length === 0
      ? options.brands
      : suggested.slice(0, SUGGESTED_BRANDS_SHOWN);

  const chooseTop = (category: CategoryOption) => {
    setTop(category);
    setSub(null);
    setProduct(null);
    setDescribing(false);
    setEditing(category.children.length > 0 ? 1 : null);
  };
  const chooseSub = (child: CategoryOption["children"][number] | null) => {
    setSub(child);
    setProduct(null);
    setEditing(null);
  };
  const chooseBrand = (item: BrandOption) => {
    setBrand(item);
    setProduct(null);
    setDescribing(false);
    setBrandFilter("");
    setEditing(null);
  };

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="categoryId" value={categoryId ?? ""} />
      <input type="hidden" name="brandId" value={brand?.id ?? ""} />
      <input type="hidden" name="productId" value={product?.id ?? ""} />

      <Step
        number={1}
        title="Category"
        open={current === 1}
        done={Boolean(top)}
        onEdit={() => setEditing(1)}
        summary={top && [top.name, sub?.name].filter(Boolean).join(" › ")}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {options.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={top?.id === category.id}
              onClick={() => chooseTop(category)}
              className={cn(
                "focus-visible:ring-ring/50 flex flex-col items-start gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-3",
                top?.id === category.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "hover:border-primary/50 hover:bg-muted/50",
              )}
            >
              <CategoryIcon slug={category.slug} className="size-5" />
              {category.name}
            </button>
          ))}
        </div>
        {top && top.children.length > 0 && (
          <div className="mt-4 grid gap-2">
            <p className="text-sm font-medium">
              Narrow it down{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <SubChip selected={!sub} onClick={() => chooseSub(null)}>
                {`Any ${top.name.toLowerCase()}`}
              </SubChip>
              {top.children.map((child) => (
                <SubChip
                  key={child.id}
                  selected={sub?.id === child.id}
                  onClick={() => chooseSub(child)}
                >
                  {child.name}
                </SubChip>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-1 w-fit"
              onClick={() => setEditing(null)}
            >
              Continue
            </Button>
          </div>
        )}
        <FieldError id="categoryId-error" message={errors.categoryId} />
      </Step>

      <Step
        number={2}
        title="Brand"
        open={current === 2}
        done={Boolean(brand)}
        onEdit={top ? () => setEditing(2) : undefined}
        summary={brand?.name}
      >
        <div className="grid gap-3">
          <div className="relative">
            <Search
              className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              type="search"
              value={brandFilter}
              onChange={(event) => setBrandFilter(event.target.value)}
              placeholder={`Find a brand among ${options.brands.length}`}
              aria-label="Find a brand"
              className="h-10 pl-9"
            />
          </div>
          {!filter && suggested.length > 0 && !showAllBrands && (
            <p className="text-muted-foreground text-xs">
              Popular for {top?.name.toLowerCase()}
            </p>
          )}
          {brandList.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No brand matches &ldquo;{brandFilter}&rdquo;. Post it as a
              broadcast instead, and SouqFeed will add the brand.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {brandList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={brand?.id === item.id}
                  onClick={() => chooseBrand(item)}
                  className={cn(
                    "focus-visible:ring-ring/50 truncate rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-3",
                    brand?.id === item.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:border-primary/50 hover:bg-muted/50",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
          {!filter &&
            suggested.length > 0 &&
            options.brands.length > brandList.length && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => setShowAllBrands(true)}
              >
                Show all {options.brands.length} brands
              </Button>
            )}
          <FieldError id="brandId-error" message={errors.brandId} />
        </div>
      </Step>

      <Step
        number={3}
        title={describing ? "Describe the product" : "Product"}
        open={current === 3 || (describing && current === 4)}
        done={Boolean(product)}
        onEdit={brand ? () => setEditing(3) : undefined}
        summary={
          product && (
            <>
              <span className="text-foreground font-medium">
                {product.title}
              </span>
              {chosenProductSummary(product) &&
                ` · ${chosenProductSummary(product)}`}
            </>
          )
        }
      >
        {brand && !describing && (
          <CatalogSearch
            brandId={brand.id}
            categoryId={categoryId}
            onChoose={(chosen) => {
              setProduct(chosen);
              setEditing(null);
            }}
            onDescribe={() => {
              setProduct(null);
              setDescribing(true);
              setEditing(null);
            }}
          />
        )}
        {describing && (
          <DescribeProduct
            template={template}
            defaults={state.values ?? {}}
            errors={errors}
            onBack={() => setDescribing(false)}
          />
        )}
        <FieldError id="productId-error" message={errors.productId} />
      </Step>

      <Step
        number={4}
        title="Price and details"
        open={current === 4}
        done={false}
      >
        <OfferDetailsFields
          defaults={detailsFrom(state.values)}
          errors={errors}
        />
      </Step>

      {current === 4 && (
        <div className="bg-card flex flex-col gap-3 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          {describing && (
            <p className="text-muted-foreground flex flex-1 gap-2 text-sm">
              <Info
                className="text-primary mt-0.5 size-4 shrink-0"
                aria-hidden
              />
              New products are checked by SouqFeed before they go live. If the
              part number matches the catalog, it goes live right away.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
            <FormMessage status={state.status} message={state.message} />
            <Button type="submit" size="lg" disabled={pending}>
              <Send aria-hidden />
              {pending
                ? "Saving…"
                : describing
                  ? "Submit offer"
                  : "Publish offer"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

function SubChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "hover:border-primary/50 hover:bg-muted/50",
      )}
    >
      {children}
    </button>
  );
}
