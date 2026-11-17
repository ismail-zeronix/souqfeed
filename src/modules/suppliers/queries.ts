import { eq } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { logger } from "@/lib/logging/logger";
import { brands } from "@/modules/brands/schema";
import { categories } from "@/modules/categories/schema";
import { getMockSupplierBySlug } from "./mock-data";
import { toSupplierProfile } from "./profile";
import { suppliers, supplierBrands, supplierCategories } from "./schema";
import type {
  AdminSupplierRow,
  SupplierProfile,
  SupplierRecordWithAssociations,
} from "./types";

/**
 * A real row always wins, and an inactive row means not-found. Only a slug
 * with no row falls back to the read-only demo profile, because mock offers
 * still link to those pages until Phase 7. Demo slugs are reserved in
 * `service.ts` so a real supplier can never be confused with one.
 */
export async function getSupplierBySlug(
  slug: string,
): Promise<SupplierProfile | undefined> {
  try {
    const [row] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.slug, slug))
      .limit(1);
    if (!row) return getMockSupplierBySlug(slug);
    if (!row.active) return undefined;

    const [brandRows, categoryRows] = await Promise.all([
      db
        .select({ name: brands.name })
        .from(supplierBrands)
        .innerJoin(brands, eq(supplierBrands.brandId, brands.id))
        .where(eq(supplierBrands.supplierId, row.id))
        .orderBy(brands.name),
      db
        .select({ name: categories.name })
        .from(supplierCategories)
        .innerJoin(categories, eq(supplierCategories.categoryId, categories.id))
        .where(eq(supplierCategories.supplierId, row.id))
        .orderBy(categories.name),
    ]);

    return toSupplierProfile(row, {
      brandNames: brandRows.map((brand) => brand.name),
      categoryNames: categoryRows.map((category) => category.name),
    });
  } catch (error) {
    logger.error({ err: error, slug }, "Supplier lookup failed");
    return getMockSupplierBySlug(slug);
  }
}

export async function getSupplierByUserId(
  userId: string,
): Promise<SupplierRecordWithAssociations | undefined> {
  const [row] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.userId, userId))
    .limit(1);
  if (!row) return undefined;

  const [brandRows, categoryRows] = await Promise.all([
    db
      .select({ brandId: supplierBrands.brandId })
      .from(supplierBrands)
      .where(eq(supplierBrands.supplierId, row.id)),
    db
      .select({ categoryId: supplierCategories.categoryId })
      .from(supplierCategories)
      .where(eq(supplierCategories.supplierId, row.id)),
  ]);

  return {
    ...row,
    brandIds: brandRows.map((brand) => brand.brandId),
    categoryIds: categoryRows.map((category) => category.categoryId),
  };
}

export async function listSuppliersForAdmin(): Promise<AdminSupplierRow[]> {
  return db
    .select({
      id: suppliers.id,
      slug: suppliers.slug,
      companyName: suppliers.companyName,
      verified: suppliers.verified,
      active: suppliers.active,
    })
    .from(suppliers)
    .orderBy(suppliers.companyName);
}

/** The few supplier fields access checks need, without the associations. */
export async function getSupplierAccount(
  userId: string,
): Promise<
  { id: string; active: boolean; companyName: string; slug: string } | undefined
> {
  const [row] = await db
    .select({
      id: suppliers.id,
      active: suppliers.active,
      companyName: suppliers.companyName,
      slug: suppliers.slug,
    })
    .from(suppliers)
    .where(eq(suppliers.userId, userId))
    .limit(1);
  return row;
}
