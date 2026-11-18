import { db } from "@/lib/database/client";
import { logger } from "@/lib/logging/logger";
import { categories } from "./schema";
import {
  buildCategoryMenu,
  fallbackMenu,
  type MenuCategory,
} from "./menu-shared";

let cached: { at: number; menu: MenuCategory[] } | null = null;
const TTL_MS = 60_000;

/** The menu every page header shows. Cached for a minute so a page view isn't a query. */
export async function getCategoryMenu(): Promise<MenuCategory[]> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.menu;
  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
      })
      .from(categories);
    const menu = rows.length > 0 ? buildCategoryMenu(rows) : fallbackMenu();
    cached = { at: Date.now(), menu };
    return menu;
  } catch (error) {
    logger.error({ err: error }, "Loading the category menu failed");
    return fallbackMenu();
  }
}
