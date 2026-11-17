import { and, asc, eq, inArray } from "drizzle-orm";
import type { db } from "@/lib/database/client";
import { broadcastItems, broadcasts } from "@/modules/broadcasts/schema";
import { products } from "@/modules/products/schema";
import { availabilityFor, specificationSnapshot } from "./derive";
import { offerObservations, offers } from "./schema";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Turns a broadcast's approved items into offers. Runs inside the publish
 * transaction. One active offer per supplier + product: updated if it exists,
 * created otherwise. Every item also appends an observation, so price and
 * quantity history is never overwritten. Returns how many offers it touched.
 */
export async function upsertOffersFromBroadcast(
  tx: Transaction,
  broadcastId: string,
  now: Date,
): Promise<number> {
  const [broadcast] = await tx
    .select({ supplierId: broadcasts.supplierId })
    .from(broadcasts)
    .where(eq(broadcasts.id, broadcastId));
  if (!broadcast) return 0;

  const items = await tx
    .select({
      id: broadcastItems.id,
      productId: broadcastItems.matchedProductId,
      cpu: broadcastItems.detectedCPU,
      ram: broadcastItems.detectedRAM,
      storage: broadcastItems.detectedStorage,
      gpu: broadcastItems.detectedGPU,
      display: broadcastItems.detectedDisplay,
      os: broadcastItems.detectedOS,
      quantity: broadcastItems.detectedQuantity,
      price: broadcastItems.detectedPrice,
      currency: broadcastItems.detectedCurrency,
      priceType: broadcastItems.priceType,
      productTitle: products.title,
      productSpecs: products.specifications,
    })
    .from(broadcastItems)
    .innerJoin(products, eq(broadcastItems.matchedProductId, products.id))
    .where(
      and(
        eq(broadcastItems.broadcastId, broadcastId),
        inArray(broadcastItems.reviewStatus, ["APPROVED", "AUTO_APPROVED"]),
      ),
    )
    .orderBy(asc(broadcastItems.position));

  // The first line wins when one broadcast lists a product twice.
  const seen = new Set<string>();
  let touched = 0;
  for (const item of items) {
    if (!item.productId || seen.has(item.productId)) continue;
    seen.add(item.productId);

    const availabilityStatus = availabilityFor(item);
    const current = {
      broadcastItemId: item.id,
      titleSnapshot: item.productTitle,
      specificationSnapshot: specificationSnapshot(item, item.productSpecs),
      price: item.price,
      // Explicit, so the column's AED default never invents a currency.
      currency: item.price === null ? null : item.currency,
      priceType: item.priceType,
      quantity: item.quantity,
      availabilityStatus,
      lastVerifiedAt: now,
      updatedAt: now,
    };

    const [existing] = await tx
      .select({ id: offers.id })
      .from(offers)
      .where(
        and(
          eq(offers.supplierId, broadcast.supplierId),
          eq(offers.productId, item.productId),
          eq(offers.active, true),
        ),
      )
      .for("update");

    let offerId: string;
    if (existing) {
      await tx.update(offers).set(current).where(eq(offers.id, existing.id));
      offerId = existing.id;
    } else {
      const [created] = await tx
        .insert(offers)
        .values({
          ...current,
          supplierId: broadcast.supplierId,
          productId: item.productId,
          publishedAt: now,
        })
        .returning({ id: offers.id });
      offerId = created.id;
    }

    await tx.insert(offerObservations).values({
      offerId,
      price: current.price,
      currency: current.currency,
      quantity: current.quantity,
      availabilityStatus,
      observedAt: now,
      broadcastItemId: item.id,
    });
    touched += 1;
  }
  return touched;
}
