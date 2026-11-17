import { eq } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { resolveUniqueSlug } from "@/lib/slug";
import { getMockSuppliers } from "./mock-data";
import { suppliers, supplierBrands, supplierCategories } from "./schema";
import type { SupplierProfileInput } from "./validation";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

function isDemoSlug(slug: string): boolean {
  return getMockSuppliers().some((supplier) => supplier.slug === slug);
}

async function replaceAssociations(
  tx: Transaction,
  supplierId: string,
  brandIds: string[],
  categoryIds: string[],
): Promise<void> {
  await tx
    .delete(supplierBrands)
    .where(eq(supplierBrands.supplierId, supplierId));
  await tx
    .delete(supplierCategories)
    .where(eq(supplierCategories.supplierId, supplierId));

  if (brandIds.length > 0) {
    await tx
      .insert(supplierBrands)
      .values(brandIds.map((brandId) => ({ supplierId, brandId })));
  }
  if (categoryIds.length > 0) {
    await tx
      .insert(supplierCategories)
      .values(categoryIds.map((categoryId) => ({ supplierId, categoryId })));
  }
}

function toProfileColumns(input: SupplierProfileInput) {
  return {
    companyName: input.companyName,
    description: input.description,
    whatsappNumber: input.whatsappNumber,
    phone: input.phone,
    email: input.email,
    website: input.website,
    locationName: input.locationName,
    address: input.address,
    googleMapsUrl: input.googleMapsUrl,
  };
}

/**
 * Self-service writes take the caller's session `userId` and never a supplier
 * id, so there is no way to target another supplier's row. `verified` and
 * `active` keep their column defaults here and are only changed by the admin
 * functions below. The slug is set once, here, and never updated.
 */
export async function createOwnProfile(
  userId: string,
  input: SupplierProfileInput,
) {
  const slug = await resolveUniqueSlug(input.companyName, async (candidate) => {
    if (isDemoSlug(candidate)) return true;
    const existing = await db
      .select({ id: suppliers.id })
      .from(suppliers)
      .where(eq(suppliers.slug, candidate))
      .limit(1);
    return existing.length > 0;
  });

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(suppliers)
      .values({ userId, slug, ...toProfileColumns(input) })
      .returning();
    await replaceAssociations(tx, row.id, input.brandIds, input.categoryIds);
    return row;
  });
}

export async function updateOwnProfile(
  userId: string,
  input: SupplierProfileInput,
) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(suppliers)
      .set({ ...toProfileColumns(input), updatedAt: new Date() })
      .where(eq(suppliers.userId, userId))
      .returning();
    if (!row) return undefined;
    await replaceAssociations(tx, row.id, input.brandIds, input.categoryIds);
    return row;
  });
}

export async function setVerified(
  supplierId: string,
  verified: boolean,
): Promise<string | undefined> {
  const [row] = await db
    .update(suppliers)
    .set({ verified, updatedAt: new Date() })
    .where(eq(suppliers.id, supplierId))
    .returning({ slug: suppliers.slug });
  return row?.slug;
}

export async function setActive(
  supplierId: string,
  active: boolean,
): Promise<string | undefined> {
  const [row] = await db
    .update(suppliers)
    .set({ active, updatedAt: new Date() })
    .where(eq(suppliers.id, supplierId))
    .returning({ slug: suppliers.slug });
  return row?.slug;
}
