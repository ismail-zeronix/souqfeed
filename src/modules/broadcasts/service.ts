import { and, count, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { broadcasts } from "./schema";
import { canTransition, type BroadcastStatus } from "./status";

export const SUBMISSIONS_PER_HOUR = 30;
const DUPLICATE_WINDOW_SECONDS = 120;

export type SubmitResult =
  | { kind: "created"; id: string }
  | { kind: "duplicate"; id: string }
  | { kind: "rate-limited" };

/**
 * Stores a pasted broadcast exactly as given, ready for parsing. The per-
 * supplier advisory lock serialises one supplier's submissions so the rate
 * limit and duplicate check can't be raced by parallel requests.
 */
export async function submitBroadcast(
  supplierId: string,
  rawText: string,
): Promise<SubmitResult> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`broadcast-submit:${supplierId}`}))`,
    );

    const [recentDuplicate] = await tx
      .select({ id: broadcasts.id })
      .from(broadcasts)
      .where(
        and(
          eq(broadcasts.supplierId, supplierId),
          eq(broadcasts.rawText, rawText),
          gt(
            broadcasts.createdAt,
            sql`now() - make_interval(secs => ${DUPLICATE_WINDOW_SECONDS})`,
          ),
        ),
      )
      .orderBy(desc(broadcasts.createdAt))
      .limit(1);
    if (recentDuplicate) return { kind: "duplicate", id: recentDuplicate.id };

    const [{ total }] = await tx
      .select({ total: count() })
      .from(broadcasts)
      .where(
        and(
          eq(broadcasts.supplierId, supplierId),
          gt(broadcasts.createdAt, sql`now() - interval '1 hour'`),
        ),
      );
    if (total >= SUBMISSIONS_PER_HOUR) return { kind: "rate-limited" };

    const [created] = await tx
      .insert(broadcasts)
      .values({ supplierId, rawText, status: "PROCESSING", source: "MANUAL" })
      .returning({ id: broadcasts.id });
    return { kind: "created", id: created.id };
  });
}

/**
 * Moves a broadcast along its lifecycle. Updates only if the broadcast is
 * still in `from`, so two workers can't both claim the same transition.
 * Returns false when the broadcast was not in `from`.
 */
export async function transitionBroadcastStatus(
  id: string,
  from: BroadcastStatus,
  to: BroadcastStatus,
): Promise<boolean> {
  if (!canTransition(from, to)) {
    throw new Error(`Broadcast status can't change from ${from} to ${to}`);
  }
  const updated = await db
    .update(broadcasts)
    .set({
      status: to,
      updatedAt: new Date(),
      ...(to === "PUBLISHED" ? { publishedAt: new Date() } : {}),
    })
    .where(and(eq(broadcasts.id, id), eq(broadcasts.status, from)))
    .returning({ id: broadcasts.id });
  return updated.length > 0;
}
