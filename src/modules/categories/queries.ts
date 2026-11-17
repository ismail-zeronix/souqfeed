import { count, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { products } from "@/modules/products/schema";
import { supplierCategories } from "@/modules/suppliers/schema";
import { toTreeOrder } from "./hierarchy";
import { categories } from "./schema";
import type { AdminCategoryRow, Category } from "./types";

export async function listCategories(): Promise<Category[]> {
  const rows = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(categories.name);
  // offerCount stays 0: real counts don't exist until Phase 7, and this list
  // only supplies the id and name for form options.
  return rows.map((row) => ({ ...row, offerCount: 0 }));
}

/** Top-level categories only, for the public market pages. */
export async function listTopLevelCategories(): Promise<Category[]> {
  const rows = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(isNull(categories.parentId))
    .orderBy(categories.name);
  return rows.map((row) => ({ ...row, offerCount: 0 }));
}

/** Every category, parents first, for indented pickers. */
export async function listCategoryTree(): Promise<
  (Category & { depth: number })[]
> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      parentId: categories.parentId,
    })
    .from(categories);
  return toTreeOrder(rows).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    depth: row.depth,
    offerCount: 0,
  }));
}

export async function listCategoriesForAdmin(): Promise<AdminCategoryRow[]> {
  const [rows, productCounts, supplierCounts] = await Promise.all([
    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
      })
      .from(categories),
    db
      .select({ id: products.categoryId, total: count() })
      .from(products)
      .where(isNotNull(products.categoryId))
      .groupBy(products.categoryId),
    db
      .select({ id: supplierCategories.categoryId, total: count() })
      .from(supplierCategories)
      .groupBy(supplierCategories.categoryId),
  ]);
  const productsBy = new Map(productCounts.map((row) => [row.id, row.total]));
  const suppliersBy = new Map(supplierCounts.map((row) => [row.id, row.total]));
  const childrenBy = new Map<string, number>();
  for (const row of rows) {
    if (row.parentId) {
      childrenBy.set(row.parentId, (childrenBy.get(row.parentId) ?? 0) + 1);
    }
  }

  return toTreeOrder(rows).map((row) => ({
    ...row,
    childCount: childrenBy.get(row.id) ?? 0,
    productCount: productsBy.get(row.id) ?? 0,
    supplierCount: suppliersBy.get(row.id) ?? 0,
  }));
}
