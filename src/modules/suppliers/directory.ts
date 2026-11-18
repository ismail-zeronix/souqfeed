import { sql } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { logger } from "@/lib/logging/logger";
import { categories } from "@/modules/categories/schema";
import { countLiveOffers } from "@/modules/offers/live";
import { offers } from "@/modules/offers/schema";
import type { DirectorySupplier } from "./directory-filter";
import { getMockSupplierBySlug, getMockSuppliers } from "./mock-data";
import { suppliers, supplierCategories } from "./schema";

function sampleDirectory(): DirectorySupplier[] {
  return getMockSuppliers().map((summary) => {
    const profile = getMockSupplierBySlug(summary.slug);
    return {
      id: summary.id,
      slug: summary.slug,
      companyName: summary.companyName,
      verified: summary.verified,
      locationName: summary.locationName,
      activeOfferCount: summary.activeOfferCount,
      categoryNames:
        profile?.categoryMix.map((slice) => slice.categoryName) ?? [],
      description: profile?.description ?? null,
      whatsappNumber: profile?.whatsappNumber ?? "",
    };
  });
}

/**
 * Every active supplier with how many live offers they have. While the market
 * has no live offers at all it shows the demo suppliers instead (the pages
 * say so), the same rule the home page uses.
 */
export async function loadSupplierDirectory(): Promise<{
  mode: "live" | "sample";
  suppliers: DirectorySupplier[];
}> {
  try {
    const { offers: liveOffers } = await countLiveOffers();
    if (liveOffers === 0)
      return { mode: "sample", suppliers: sampleDirectory() };

    const rows = await db
      .select({
        id: suppliers.id,
        slug: suppliers.slug,
        companyName: suppliers.companyName,
        verified: suppliers.verified,
        locationName: suppliers.locationName,
        description: suppliers.description,
        whatsappNumber: suppliers.whatsappNumber,
        activeOfferCount: sql<number>`(
          select count(*) from ${offers}
          where ${offers.supplierId} = ${suppliers.id} and ${offers.active}
        )`.mapWith(Number),
        categoryNames: sql<string[]>`coalesce(array(
          select ${categories.name} from ${supplierCategories}
          inner join ${categories} on ${categories.id} = ${supplierCategories.categoryId}
          where ${supplierCategories.supplierId} = ${suppliers.id}
          order by ${categories.name}
        ), '{}')`,
      })
      .from(suppliers)
      .where(sql`${suppliers.active}`);

    return {
      mode: "live",
      suppliers: rows.map((row) => ({
        ...row,
        locationName: row.locationName ?? "",
      })),
    };
  } catch (error) {
    logger.error({ err: error }, "Loading the supplier directory failed");
    return { mode: "sample", suppliers: sampleDirectory() };
  }
}
