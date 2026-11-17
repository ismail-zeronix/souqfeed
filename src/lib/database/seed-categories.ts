import { db } from "@/lib/database/client";
import { categories } from "@/modules/categories/schema";

const CATEGORY_SEED = [
  ["Laptops", "laptops"],
  ["Desktops", "desktops"],
  ["Storage", "storage"],
  ["Networking", "networking"],
  ["Components", "components"],
  ["Monitors", "monitors"],
  ["Accessories", "accessories"],
  ["Software", "software"],
  ["Servers", "servers"],
  ["Phones", "phones"],
  ["Printers", "printers"],
  ["Security", "security"],
  ["Power & UPS", "power-ups"],
] as const;

// Safe to re-run: adds only missing categories, so it never undoes an admin's rename.
async function seedCategories() {
  for (const [name, slug] of CATEGORY_SEED) {
    await db.insert(categories).values({ name, slug }).onConflictDoNothing();
  }

  console.log(`Seeded ${CATEGORY_SEED.length} categories.`);
}

seedCategories()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
