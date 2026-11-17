import { db } from "@/lib/database/client";
import { IT_BRANDS } from "@/modules/brands/it-brands";
import { brands } from "@/modules/brands/schema";

// Safe to re-run: adds only missing brands, so it never undoes an admin's rename.
async function seedBrands() {
  const added = await db
    .insert(brands)
    .values(IT_BRANDS.map(({ name, slug }) => ({ name, slug })))
    .onConflictDoNothing()
    .returning({ id: brands.id });

  console.log(`Seeded brands: ${added.length} added.`);
}

seedBrands()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
