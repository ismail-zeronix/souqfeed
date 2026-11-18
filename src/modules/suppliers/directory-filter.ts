export interface DirectorySupplier {
  id: string;
  slug: string;
  companyName: string;
  verified: boolean;
  locationName: string;
  activeOfferCount: number;
  categoryNames: string[];
  description: string | null;
  whatsappNumber: string;
}

export type DirectorySort = "offers" | "name";

export interface DirectoryFilters {
  q: string;
  category: string;
  location: string;
  verifiedOnly: boolean;
  sort: DirectorySort;
}

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function parseDirectoryParams(params: Params): DirectoryFilters {
  return {
    q: first(params.q).slice(0, 80),
    category: first(params.category).slice(0, 80),
    location: first(params.location).slice(0, 80),
    verifiedOnly: first(params.verified) === "1",
    sort: first(params.sort) === "name" ? "name" : "offers",
  };
}

/** Applies the directory's filters and ordering. Ties always fall back to A to Z. */
export function filterDirectory(
  suppliers: DirectorySupplier[],
  filters: DirectoryFilters,
): DirectorySupplier[] {
  const needle = filters.q.toLowerCase();
  const result = suppliers.filter((supplier) => {
    if (filters.verifiedOnly && !supplier.verified) return false;
    if (filters.location && supplier.locationName !== filters.location) {
      return false;
    }
    if (
      filters.category &&
      !supplier.categoryNames.includes(filters.category)
    ) {
      return false;
    }
    if (needle) {
      const haystack = [
        supplier.companyName,
        supplier.locationName,
        ...supplier.categoryNames,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
  return result.sort((a, b) => {
    if (
      filters.sort === "offers" &&
      a.activeOfferCount !== b.activeOfferCount
    ) {
      return b.activeOfferCount - a.activeOfferCount;
    }
    return a.companyName.localeCompare(b.companyName);
  });
}

/** The distinct, sorted values for the filter dropdowns. */
export function directoryOptions(suppliers: DirectorySupplier[]) {
  const locations = new Set<string>();
  const categories = new Set<string>();
  for (const supplier of suppliers) {
    if (supplier.locationName) locations.add(supplier.locationName);
    supplier.categoryNames.forEach((name) => categories.add(name));
  }
  return {
    locations: [...locations].sort((a, b) => a.localeCompare(b)),
    categories: [...categories].sort((a, b) => a.localeCompare(b)),
  };
}
