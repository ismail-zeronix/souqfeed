import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { PaginationNav } from "@/components/broadcasts/pagination-nav";
import { SearchFiltersForm } from "@/components/search/search-filters";
import { SearchResultCard } from "@/components/search/search-result-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listBrands } from "@/modules/brands/queries";
import { listCategoryTree } from "@/modules/categories/queries";
import {
  parseSearchParams,
  searchUrl,
  type SearchFilters,
} from "@/modules/search/params";
import { listSearchFacets, searchProducts } from "@/modules/search/queries";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { query } = parseSearchParams(await searchParams);
  return {
    title: query ? `${query} — Search` : "Search IT stock",
    description:
      "Search live IT stock from Dubai wholesale suppliers by part number, model, or specs.",
    // Result pages change minute to minute; the search page itself is the entry.
    robots: query ? { index: false, follow: true } : undefined,
  };
}

function isFiltered(filters: SearchFilters) {
  return Boolean(
    filters.brandId ||
    filters.categoryId ||
    filters.supplierSlug ||
    filters.location ||
    filters.price ||
    filters.availableOnly ||
    filters.fresh,
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseSearchParams(await searchParams);
  const [result, brands, categories, facets] = await Promise.all([
    searchProducts(filters),
    listBrands(),
    listCategoryTree(),
    listSearchFacets(),
  ]);

  return (
    <div className="bg-muted/30 flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
        <form
          method="get"
          action="/search"
          role="search"
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search
              className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              name="q"
              type="search"
              defaultValue={filters.query}
              placeholder="Part number, model, or specs, e.g. 21U20063GR, Lenovo E14, 16 512 SSD"
              aria-label="Search IT stock"
              className="bg-background h-11 pl-9 text-base"
            />
          </div>
          <Button type="submit" size="lg" className="h-11">
            Search
          </Button>
        </form>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[16rem_1fr]">
          <SearchFiltersForm
            filters={filters}
            brands={brands}
            categories={categories}
            facets={facets}
          />

          <section aria-live="polite" className="min-w-0">
            <h1 className="mb-3 text-lg font-semibold">
              {filters.query ? (
                <>
                  {result.total} {result.total === 1 ? "product" : "products"}{" "}
                  for &ldquo;{filters.query}&rdquo;
                </>
              ) : (
                <>
                  {result.total} {result.total === 1 ? "product" : "products"}{" "}
                  in stock now
                </>
              )}
            </h1>

            {result.groups.length === 0 ? (
              <div className="bg-card text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
                {filters.query || isFiltered(filters) ? (
                  <>
                    No live offers match yet. Try fewer words, or{" "}
                    <Link
                      href="/search"
                      className="text-primary hover:underline"
                    >
                      clear the search
                    </Link>
                    .
                  </>
                ) : (
                  "No supplier has published live offers yet."
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {result.groups.map((group) => (
                  <SearchResultCard key={group.productId} group={group} />
                ))}
              </div>
            )}

            <PaginationNav
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              noun={["product", "products"]}
              hrefFor={(page) => searchUrl(filters, page)}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
