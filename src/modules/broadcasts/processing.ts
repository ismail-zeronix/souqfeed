import { and, asc, eq, lt, sql } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { brands } from "@/modules/brands/schema";
import { RuleBasedBroadcastParser } from "./parser/rule-based-parser";
import type { ParsedItem } from "./parser/types";
import { broadcastItems, broadcasts } from "./schema";

const parser = new RuleBasedBroadcastParser();

export const NO_PRODUCTS_NOTE =
  "We couldn't find any products in this broadcast. Check that each product is on its own line with a brand or model, then post it again.";
export const PARSE_ERROR_NOTE =
  "Something went wrong while reading this broadcast. The SouqFeed team has been notified.";

function toItemRow(broadcastId: string, item: ParsedItem, position: number) {
  return {
    broadcastId,
    position,
    rawLine: item.rawLine,
    rawBlock: item.rawBlock,
    detectedBrand: item.brand,
    detectedModel: item.model,
    detectedPartNumber: item.partNumber,
    detectedCPU: item.cpu,
    detectedRAM: item.ram,
    detectedStorage: item.storage,
    detectedGPU: item.gpu,
    detectedDisplay: item.display,
    detectedOS: item.os,
    detectedQuantity: item.quantity,
    detectedPrice: item.price === null ? null : String(item.price),
    // Explicit, so the column's AED default never invents a currency (Rule 10).
    detectedCurrency: item.currency,
    priceType: item.priceType,
  };
}

export type ProcessResult = "review" | "failed" | "skipped";

/**
 * Parses one broadcast and stores its items. Only acts on a broadcast that is
 * still PROCESSING (checked under a row lock), so a duplicate or late job is
 * harmless. Re-running replaces the items from the earlier attempt.
 */
export async function processBroadcast(id: string): Promise<ProcessResult> {
  const [row] = await db
    .select({ rawText: broadcasts.rawText, status: broadcasts.status })
    .from(broadcasts)
    .where(eq(broadcasts.id, id))
    .limit(1);
  if (!row || row.status !== "PROCESSING") return "skipped";

  const brandRows = await db
    .select({ name: brands.name })
    .from(brands)
    .orderBy(asc(brands.name));
  const parsed = parser.parse(row.rawText, {
    brands: brandRows.map((brand) => brand.name),
  });

  return db.transaction(async (tx) => {
    const [locked] = await tx
      .select({ id: broadcasts.id })
      .from(broadcasts)
      .where(and(eq(broadcasts.id, id), eq(broadcasts.status, "PROCESSING")))
      .for("update");
    if (!locked) return "skipped";

    await tx.delete(broadcastItems).where(eq(broadcastItems.broadcastId, id));
    const rows = parsed.items.map((item, index) => toItemRow(id, item, index));
    for (let start = 0; start < rows.length; start += 100) {
      await tx.insert(broadcastItems).values(rows.slice(start, start + 100));
    }

    const found = rows.length > 0;
    await tx
      .update(broadcasts)
      .set({
        status: found ? "REVIEW" : "FAILED",
        statusNote: found ? null : NO_PRODUCTS_NOTE,
        updatedAt: new Date(),
      })
      .where(eq(broadcasts.id, id));
    return found ? "review" : "failed";
  });
}

/** Marks a broadcast FAILED after its last parsing attempt errored. */
export async function markParseFailed(id: string): Promise<void> {
  await db
    .update(broadcasts)
    .set({
      status: "FAILED",
      statusNote: PARSE_ERROR_NOTE,
      updatedAt: new Date(),
    })
    .where(and(eq(broadcasts.id, id), eq(broadcasts.status, "PROCESSING")));
}

/** Broadcasts left in PROCESSING longer than `olderThanSeconds`. */
export async function findStalledBroadcasts(
  olderThanSeconds: number,
  limit = 100,
): Promise<string[]> {
  const rows = await db
    .select({ id: broadcasts.id })
    .from(broadcasts)
    .where(
      and(
        eq(broadcasts.status, "PROCESSING"),
        lt(
          broadcasts.updatedAt,
          sql`now() - make_interval(secs => ${olderThanSeconds})`,
        ),
      ),
    )
    .orderBy(asc(broadcasts.updatedAt))
    .limit(limit);
  return rows.map((row) => row.id);
}
