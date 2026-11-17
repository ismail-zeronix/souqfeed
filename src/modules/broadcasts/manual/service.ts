import { and, count, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { brands } from "@/modules/brands/schema";
import { categories } from "@/modules/categories/schema";
import { products } from "@/modules/products/schema";
import { findCandidates } from "../matcher/candidates";
import { decideMatch, type MatchResult } from "../matcher/decide";
import { publishInTransaction } from "../review";
import { broadcastItems, broadcasts } from "../schema";
import { renderManualOffer } from "./render";
import type { SpecField } from "@/modules/categories/spec-templates";
import type { ManualOfferInput } from "./validation";

/** Separate from the paste limit: entering stock by hand is one row at a time. */
export const FORM_SUBMISSIONS_PER_HOUR = 120;

export type ManualOfferResult =
  | { kind: "published"; broadcastId: string }
  | { kind: "review"; broadcastId: string }
  | { kind: "rate-limited" }
  | { kind: "invalid"; field: string; message: string };

/**
 * Turns an add-offer form into a one-item broadcast (source FORM) whose text
 * is what the supplier entered. A chosen catalog product is approved by the
 * supplier's own choice and published in the same transaction. A described
 * product goes through the matcher: published if it matches with confidence,
 * otherwise left in review for SouqFeed to add to the catalog.
 */
export async function submitManualOffer(
  supplierId: string,
  input: ManualOfferInput,
  template: SpecField[] = [],
): Promise<ManualOfferResult> {
  const [brand] = await db
    .select({ name: brands.name })
    .from(brands)
    .where(eq(brands.id, input.brandId))
    .limit(1);
  if (!brand) {
    return { kind: "invalid", field: "brandId", message: "Choose a brand" };
  }
  const [category] = input.categoryId
    ? await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, input.categoryId))
        .limit(1)
    : [];
  if (input.categoryId && !category) {
    return {
      kind: "invalid",
      field: "categoryId",
      message: "Choose a category",
    };
  }

  let match: MatchResult;
  let product = {
    brandName: brand.name,
    title: "",
    partNumber: null as string | null,
  };
  if (input.productId) {
    const [row] = await db
      .select({ title: products.title, partNumber: products.partNumber })
      .from(products)
      .where(
        and(
          eq(products.id, input.productId),
          eq(products.brandId, input.brandId),
          eq(products.active, true),
        ),
      )
      .limit(1);
    if (!row) {
      return {
        kind: "invalid",
        field: "productId",
        message: "That product is no longer in the catalog. Choose another.",
      };
    }
    product = { ...product, ...row };
    match = {
      productId: input.productId,
      confidence: 1,
      method: "MANUAL",
      reasons: [`Chosen by the supplier in the add-offer form: ${row.title}`],
      reviewStatus: "AUTO_APPROVED",
    };
  } else {
    // Matching reads the catalog, so it runs before the write transaction.
    const item = {
      brand: brand.name,
      model: input.model,
      partNumber: input.partNumber,
      cpu: input.specs.cpu ?? null,
      ram: input.specs.ram ?? null,
      storage: input.specs.storage ?? null,
    };
    match = decideMatch(item, await findCandidates(item));
  }

  const { rawText, rawLine } = renderManualOffer(input, product, template);
  const approved = match.reviewStatus === "AUTO_APPROVED";

  return db.transaction(async (tx) => {
    // Shares the paste form's lock, so one supplier's submissions serialise.
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`broadcast-submit:${supplierId}`}))`,
    );
    const [{ total }] = await tx
      .select({ total: count() })
      .from(broadcasts)
      .where(
        and(
          eq(broadcasts.supplierId, supplierId),
          eq(broadcasts.source, "FORM"),
          gt(broadcasts.createdAt, sql`now() - interval '1 hour'`),
        ),
      );
    if (total >= FORM_SUBMISSIONS_PER_HOUR) return { kind: "rate-limited" };

    const [created] = await tx
      .insert(broadcasts)
      .values({ supplierId, rawText, status: "REVIEW", source: "FORM" })
      .returning({ id: broadcasts.id });

    await tx.insert(broadcastItems).values({
      broadcastId: created.id,
      position: 0,
      rawLine,
      rawBlock: rawText,
      detectedBrand: brand.name,
      detectedModel: input.model,
      detectedPartNumber: input.partNumber ?? product.partNumber,
      detectedCPU: input.specs.cpu ?? null,
      detectedRAM: input.specs.ram ?? null,
      detectedStorage: input.specs.storage ?? null,
      detectedGPU: input.specs.gpu ?? null,
      detectedDisplay: input.specs.display ?? null,
      detectedOS: input.specs.os ?? null,
      detectedQuantity: input.quantity,
      detectedPrice: input.price === null ? null : String(input.price),
      // Explicit, so the column's AED default never invents a currency.
      detectedCurrency: input.price === null ? null : input.currency,
      priceType: input.priceType,
      condition: input.condition,
      warranty: input.warranty,
      notes: input.notes,
      categoryId: input.categoryId,
      extraSpecs:
        Object.keys(input.extraSpecs).length > 0 ? input.extraSpecs : null,
      matchedProductId: match.productId,
      matchConfidence: String(match.confidence),
      matchMethod: match.method,
      matchReasons: match.reasons,
      // The supplier's own choice is an approval, not a guess.
      reviewStatus: input.productId ? "APPROVED" : match.reviewStatus,
    });

    if (!approved) return { kind: "review", broadcastId: created.id };
    const published = await publishInTransaction(tx, created.id);
    if (!published.ok) {
      throw new Error(`Form broadcast did not publish: ${published.reason}`);
    }
    return { kind: "published", broadcastId: created.id };
  });
}

/**
 * A form broadcast publishes itself once staff (or the supplier) have decided
 * its item, since submitting the form already asked for it to go live.
 * Returns true if it was published.
 */
export async function publishFormBroadcastIfDecided(
  broadcastId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ source: broadcasts.source, status: broadcasts.status })
    .from(broadcasts)
    .where(eq(broadcasts.id, broadcastId))
    .limit(1);
  if (row?.source !== "FORM" || row.status !== "REVIEW") return false;
  const result = await db.transaction((tx) =>
    publishInTransaction(tx, broadcastId),
  );
  return result.ok;
}
