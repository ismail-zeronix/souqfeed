import { eq } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { resolveUniqueSlug } from "@/lib/slug";
import { wouldCreateCycle } from "./hierarchy";
import { categories } from "./schema";
import type { CategoryInput } from "./validation";

export async function createCategory(input: CategoryInput): Promise<void> {
  const slug = await resolveUniqueSlug(
    input.name,
    async (candidate) => {
      const existing = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, candidate))
        .limit(1);
      return existing.length > 0;
    },
    "category",
  );
  await db
    .insert(categories)
    .values({ name: input.name, slug, parentId: input.parentId });
}

/**
 * Locks the rows being checked, so two simultaneous moves can't combine into a
 * cycle that neither would create alone. The slug is never changed.
 */
export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<"updated" | "missing" | "cycle"> {
  return db.transaction(async (tx) => {
    const nodes = await tx
      .select({ id: categories.id, parentId: categories.parentId })
      .from(categories)
      .for("update");
    if (!nodes.some((node) => node.id === id)) return "missing";
    if (wouldCreateCycle(nodes, id, input.parentId)) return "cycle";

    await tx
      .update(categories)
      .set({
        name: input.name,
        parentId: input.parentId,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id));
    return "updated";
  });
}

/** Foreign keys reject this while a child, product, or supplier uses it. */
export async function deleteCategory(id: string): Promise<boolean> {
  const rows = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning({ id: categories.id });
  return rows.length > 0;
}
