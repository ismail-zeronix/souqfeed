import { IT_TAXONOMY, TOP_LEVEL_SLUGS } from "./it-taxonomy";

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

interface Row {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

/**
 * Top-level categories in the order buyers expect (the taxonomy's order, with
 * anything staff added after it), each with its subcategories A to Z. Anything
 * deeper than two levels is listed under its top-level ancestor.
 */
export function buildCategoryMenu(rows: Row[]): MenuCategory[] {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const topOf = (row: Row): Row => {
    let current = row;
    const seen = new Set<string>();
    while (current.parentId && byId.has(current.parentId)) {
      if (seen.has(current.id)) break;
      seen.add(current.id);
      current = byId.get(current.parentId)!;
    }
    return current;
  };

  const tops = rows.filter((row) => !row.parentId || !byId.has(row.parentId));
  const rank = (slug: string) => {
    const index = TOP_LEVEL_SLUGS.indexOf(slug);
    return index === -1 ? TOP_LEVEL_SLUGS.length : index;
  };
  tops.sort(
    (a, b) => rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name),
  );

  return tops.map((top) => ({
    id: top.id,
    name: top.name,
    slug: top.slug,
    children: rows
      .filter((row) => row.id !== top.id && topOf(row).id === top.id)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ id, name, slug }) => ({ id, name, slug })),
  }));
}

/** Used if the database can't be read: the built-in taxonomy, without ids. */
export function fallbackMenu(): MenuCategory[] {
  return IT_TAXONOMY.map((category) => ({
    id: "",
    name: category.name,
    slug: category.slug,
    children: category.children.map((child) => ({ id: "", ...child })),
  }));
}

/** Where a menu entry links to. Entries without an id (fallback) search by name. */
export function categoryHref(entry: { id: string; name: string }): string {
  return entry.id
    ? `/search?category=${entry.id}`
    : `/search?q=${encodeURIComponent(entry.name)}`;
}
