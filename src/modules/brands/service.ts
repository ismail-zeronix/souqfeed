import { eq } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { slugify } from "@/lib/slug";
import { brands } from "./schema";
import type { BrandInput } from "./validation";

export async function createBrand(input: BrandInput): Promise<void> {
  await db
    .insert(brands)
    .values({ name: input.name, slug: slugify(input.name) });
}

/** Renaming keeps the slug, so existing links keep working. */
export async function renameBrand(
  id: string,
  input: BrandInput,
): Promise<boolean> {
  const rows = await db
    .update(brands)
    .set({ name: input.name, updatedAt: new Date() })
    .where(eq(brands.id, id))
    .returning({ id: brands.id });
  return rows.length > 0;
}

/** Foreign keys reject this while a product or supplier still uses the brand. */
export async function deleteBrand(id: string): Promise<boolean> {
  const rows = await db
    .delete(brands)
    .where(eq(brands.id, id))
    .returning({ id: brands.id });
  return rows.length > 0;
}
