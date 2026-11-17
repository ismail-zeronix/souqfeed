import { eq } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { IT_TAXONOMY } from "@/modules/categories/it-taxonomy";
import { categories } from "@/modules/categories/schema";

/**
 * Safe to re-run: adds only missing categories (by slug), so it never undoes
 * an admin's rename or move. Children attach to whatever row now holds the
 * parent's slug.
 */
async function seedCategories() {
  let added = 0;
  for (const top of IT_TAXONOMY) {
    added += (
      await db
        .insert(categories)
        .values({ name: top.name, slug: top.slug })
        .onConflictDoNothing()
        .returning({ id: categories.id })
    ).length;

    const [parent] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, top.slug));
    if (!parent) continue;

    for (const child of top.children) {
      added += (
        await db
          .insert(categories)
          .values({ name: child.name, slug: child.slug, parentId: parent.id })
          .onConflictDoNothing()
          .returning({ id: categories.id })
      ).length;
    }
  }

  console.log(`Seeded categories: ${added} added.`);
}

seedCategories()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
