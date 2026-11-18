import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageBanner } from "@/components/layout/page-banner";
import { SampleDataNotice } from "@/components/market/sample-data-notice";
import { SupplierDirectoryCard } from "@/components/suppliers/supplier-directory-card";
import { SouqFeedAgent } from "@/components/ui/souqfeed-agent";
import { loadSupplierDirectory } from "@/modules/suppliers/directory";
import {
  directoryOptions,
  filterDirectory,
  parseDirectoryParams,
} from "@/modules/suppliers/directory-filter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suppliers — Dubai IT wholesale",
  description:
    "Browse IT wholesale suppliers in Dubai: what they stock, where they are, and how many offers they have live.",
};

const selectClass =
  "border-border h-11 min-w-0 rounded-xl border bg-white px-3 text-sm outline-none focus:border-[#b9a6ff]";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseDirectoryParams(await searchParams);
  const { mode, suppliers } = await loadSupplierDirectory();
  const options = directoryOptions(suppliers);
  const results = filterDirectory(suppliers, filters);
  const liveOffers = suppliers.reduce((sum, s) => sum + s.activeOfferCount, 0);
  const filtered = Boolean(
    filters.q || filters.category || filters.location || filters.verifiedOnly,
  );

  return (
    <>
      {mode === "sample" && <SampleDataNotice />}
      <div className="mx-auto w-full max-w-[1240px] px-4 py-5 md:px-5 md:py-8">
        <PageBanner
          eyebrow="Supplier directory"
          title="Find who stocks it"
          description="Dubai IT wholesalers, what they carry, and how much they have live right now."
          mascot="waving"
        >
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="text-foreground rounded-full bg-white/80 px-3 py-1.5">
              {suppliers.length} suppliers
            </span>
            <span className="text-foreground rounded-full bg-white/80 px-3 py-1.5">
              {liveOffers.toLocaleString()} live offers
            </span>
          </div>
        </PageBanner>

        <form
          role="search"
          className="mt-5 flex flex-col gap-2.5 rounded-3xl border border-[#e6e0ff] bg-white p-3 md:flex-row md:items-center"
        >
          <div className="border-border flex h-11 items-center gap-2 rounded-xl border bg-white px-3 focus-within:border-[#b9a6ff] md:flex-1">
            <Search className="text-muted-foreground size-4 shrink-0" />
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder="Search supplier, area or category…"
              aria-label="Search suppliers"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:contents">
            <select
              name="category"
              defaultValue={filters.category}
              aria-label="Category"
              className={selectClass}
            >
              <option value="">All categories</option>
              {options.categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              name="location"
              defaultValue={filters.location}
              aria-label="Area"
              className={selectClass}
            >
              <option value="">All areas</option>
              {options.locations.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={filters.sort}
              aria-label="Sort by"
              className={`${selectClass} col-span-2 md:col-span-1`}
            >
              <option value="offers">Most live offers</option>
              <option value="name">Name A to Z</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3 md:contents">
            <label className="flex h-11 items-center gap-2 px-1 text-sm font-medium">
              <input
                type="checkbox"
                name="verified"
                value="1"
                defaultChecked={filters.verifiedOnly}
                className="size-4 accent-[#6c42f5]"
              />
              Verified only
            </label>
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 h-11 flex-1 rounded-xl px-6 text-sm font-semibold text-white md:flex-none"
            >
              Apply
            </button>
          </div>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {results.length} {results.length === 1 ? "supplier" : "suppliers"}
            {filtered ? " match" : ""}
          </p>
          {filtered && (
            <Link href="/suppliers" className="text-primary font-semibold">
              Clear filters
            </Link>
          )}
        </div>

        {results.length > 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((supplier) => (
              <SupplierDirectoryCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-[#d9d0ff] bg-white px-6 py-12 text-center">
            <SouqFeedAgent state="thinking" size="lg" alt="" />
            <p className="font-display text-foreground mt-3 text-lg font-extrabold">
              No suppliers match
            </p>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Try a different area or category, or clear the filters.
            </p>
            <Link
              href="/suppliers"
              className="bg-primary mt-4 rounded-full px-5 py-2 text-sm font-semibold text-white"
            >
              Show all suppliers
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
