import { and, eq } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { mergeSpecifications, normalizeTitle, type SpecKey } from "./normalize";
import { productAliases, products } from "./schema";
import type { ProductInput } from "./validation";

function pickSpecs(input: ProductInput): Record<SpecKey, string | null> {
  const { cpu, ram, storage, gpu, display, os } = input;
  return { cpu, ram, storage, gpu, display, os };
}

function toColumns(input: ProductInput) {
  return {
    brandId: input.brandId,
    categoryId: input.categoryId,
    title: input.title,
    normalizedTitle: normalizeTitle(input.title),
    family: input.family,
    model: input.model,
    partNumber: input.partNumber,
  };
}

export async function createProduct(input: ProductInput): Promise<string> {
  const [row] = await db
    .insert(products)
    .values({
      ...toColumns(input),
      specifications: mergeSpecifications(null, pickSpecs(input)),
    })
    .returning({ id: products.id });
  return row.id;
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ specifications: products.specifications })
      .from(products)
      .where(eq(products.id, id))
      .for("update");
    if (!existing) return false;

    await tx
      .update(products)
      .set({
        ...toColumns(input),
        specifications: mergeSpecifications(
          existing.specifications,
          pickSpecs(input),
        ),
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
    return true;
  });
}

/**
 * Products are deactivated rather than deleted, because broadcast items, offers,
 * and analytics point at them and that history must stay traceable (Rule 9).
 */
export async function setProductActive(
  id: string,
  active: boolean,
): Promise<boolean> {
  const rows = await db
    .update(products)
    .set({ active, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning({ id: products.id });
  return rows.length > 0;
}

export async function addAlias(
  productId: string,
  alias: string,
): Promise<void> {
  await db.insert(productAliases).values({ productId, alias });
}

export async function removeAlias(
  productId: string,
  aliasId: string,
): Promise<boolean> {
  const rows = await db
    .delete(productAliases)
    .where(
      and(
        eq(productAliases.id, aliasId),
        eq(productAliases.productId, productId),
      ),
    )
    .returning({ id: productAliases.id });
  return rows.length > 0;
}
