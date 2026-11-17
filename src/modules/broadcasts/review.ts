import { and, count, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { brands } from "@/modules/brands/schema";
import { upsertOffersFromBroadcast } from "@/modules/offers/publish";
import { products } from "@/modules/products/schema";
import { suppliers } from "@/modules/suppliers/schema";
import { broadcastItems, broadcasts } from "./schema";

/** Only items of a broadcast still in REVIEW can change. */
const inReview = sql`exists (
  select 1 from ${broadcasts}
  where ${broadcasts.id} = ${broadcastItems.broadcastId}
    and ${broadcasts.status} = 'REVIEW'
)`;

export interface ReviewTarget {
  broadcastId: string;
  status: string;
  supplierUserId: string;
}

/** Who owns the broadcast an item belongs to, for access checks. */
export async function getItemReviewTarget(
  itemId: string,
): Promise<ReviewTarget | undefined> {
  const [row] = await db
    .select({
      broadcastId: broadcasts.id,
      status: broadcasts.status,
      supplierUserId: suppliers.userId,
    })
    .from(broadcastItems)
    .innerJoin(broadcasts, eq(broadcastItems.broadcastId, broadcasts.id))
    .innerJoin(suppliers, eq(broadcasts.supplierId, suppliers.id))
    .where(eq(broadcastItems.id, itemId))
    .limit(1);
  return row;
}

export async function getBroadcastReviewTarget(
  broadcastId: string,
): Promise<ReviewTarget | undefined> {
  const [row] = await db
    .select({
      broadcastId: broadcasts.id,
      status: broadcasts.status,
      supplierUserId: suppliers.userId,
    })
    .from(broadcasts)
    .innerJoin(suppliers, eq(broadcasts.supplierId, suppliers.id))
    .where(eq(broadcasts.id, broadcastId))
    .limit(1);
  return row;
}

/** Approves an item's current product. False if it has none or can't change. */
export async function approveItem(itemId: string): Promise<boolean> {
  const updated = await db
    .update(broadcastItems)
    .set({ reviewStatus: "APPROVED", updatedAt: new Date() })
    .where(
      and(
        eq(broadcastItems.id, itemId),
        sql`${broadcastItems.matchedProductId} is not null`,
        inReview,
      ),
    )
    .returning({ id: broadcastItems.id });
  return updated.length > 0;
}

/** Leaves an item out of publishing. */
export async function rejectItem(itemId: string): Promise<boolean> {
  const updated = await db
    .update(broadcastItems)
    .set({ reviewStatus: "REJECTED", updatedAt: new Date() })
    .where(and(eq(broadcastItems.id, itemId), inReview))
    .returning({ id: broadcastItems.id });
  return updated.length > 0;
}

/**
 * Sets the product a person chose. The reason records who chose it, so the
 * match stays traceable (Rule 9). False if the product isn't active.
 */
export async function chooseItemProduct(
  itemId: string,
  productId: string,
  chosenBy: "supplier" | "SouqFeed staff",
): Promise<boolean> {
  const [product] = await db
    .select({ title: products.title })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.active, true)))
    .limit(1);
  if (!product) return false;

  const updated = await db
    .update(broadcastItems)
    .set({
      matchedProductId: productId,
      matchConfidence: "1",
      matchMethod: "MANUAL",
      matchReasons: [
        `Chosen by the ${chosenBy} during review: ${product.title}`,
      ],
      reviewStatus: "APPROVED",
      updatedAt: new Date(),
    })
    .where(and(eq(broadcastItems.id, itemId), inReview))
    .returning({ id: broadcastItems.id });
  return updated.length > 0;
}

/** Rejects every item in the broadcast that has no product. Returns how many. */
export async function rejectUnmatchedItems(
  broadcastId: string,
): Promise<number> {
  const updated = await db
    .update(broadcastItems)
    .set({ reviewStatus: "REJECTED", updatedAt: new Date() })
    .where(
      and(
        eq(broadcastItems.broadcastId, broadcastId),
        isNull(broadcastItems.matchedProductId),
        inReview,
      ),
    )
    .returning({ id: broadcastItems.id });
  return updated.length;
}

export type PublishResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not-in-review" | "needs-review" | "nothing-approved";
    };

/**
 * REVIEW → PUBLISHED once every item is decided and at least one is approved,
 * creating or updating offers in the same transaction. The broadcast row is
 * locked, so two clicks can't publish twice.
 */
export async function publishBroadcast(
  broadcastId: string,
): Promise<PublishResult> {
  return db.transaction(async (tx) => {
    const [locked] = await tx
      .select({ id: broadcasts.id })
      .from(broadcasts)
      .where(
        and(eq(broadcasts.id, broadcastId), eq(broadcasts.status, "REVIEW")),
      )
      .for("update");
    if (!locked) return { ok: false, reason: "not-in-review" };

    const counts = await tx
      .select({ status: broadcastItems.reviewStatus, total: count() })
      .from(broadcastItems)
      .where(eq(broadcastItems.broadcastId, broadcastId))
      .groupBy(broadcastItems.reviewStatus);
    const of = (status: string) =>
      counts.find((row) => row.status === status)?.total ?? 0;
    if (of("NEEDS_REVIEW") > 0) return { ok: false, reason: "needs-review" };
    if (of("APPROVED") + of("AUTO_APPROVED") === 0) {
      return { ok: false, reason: "nothing-approved" };
    }

    const now = new Date();
    await upsertOffersFromBroadcast(tx, broadcastId, now);
    await tx
      .update(broadcasts)
      .set({ status: "PUBLISHED", publishedAt: now, updatedAt: now })
      .where(eq(broadcasts.id, broadcastId));
    return { ok: true };
  });
}

/** Active catalog products for the review picker, by title or part number. */
export async function searchProductsForReview(
  query: string,
  brandName: string | null,
): Promise<
  { id: string; title: string; brandName: string; partNumber: string | null }[]
> {
  const term = query.trim();
  if (term.length < 2) return [];
  const pattern = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

  return (
    db
      .select({
        id: products.id,
        title: products.title,
        brandName: brands.name,
        partNumber: products.partNumber,
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .where(
        and(
          eq(products.active, true),
          sql`(${products.title} ilike ${pattern} or ${products.partNumber} ilike ${pattern})`,
        ),
      )
      // The detected brand's products first, then closest titles.
      .orderBy(
        sql`(lower(${brands.name}) = ${(brandName ?? "").toLowerCase()}) desc`,
        sql`similarity(${products.normalizedTitle}, lower(${term})) desc`,
      )
      .limit(10)
  );
}

/** Brand id for a detected brand name, if the catalog has that brand. */
export async function findBrandIdByName(
  name: string,
): Promise<string | undefined> {
  const [row] = await db
    .select({ id: brands.id })
    .from(brands)
    .where(sql`lower(${brands.name}) = ${name.toLowerCase()}`)
    .limit(1);
  return row?.id;
}

/** The item fields a staff member turns into a catalog product. */
export async function getItemForProduct(itemId: string) {
  const [row] = await db
    .select({
      brand: broadcastItems.detectedBrand,
      model: broadcastItems.detectedModel,
      partNumber: broadcastItems.detectedPartNumber,
      cpu: broadcastItems.detectedCPU,
      ram: broadcastItems.detectedRAM,
      storage: broadcastItems.detectedStorage,
      gpu: broadcastItems.detectedGPU,
      display: broadcastItems.detectedDisplay,
      os: broadcastItems.detectedOS,
    })
    .from(broadcastItems)
    .where(eq(broadcastItems.id, itemId))
    .limit(1);
  return row;
}
