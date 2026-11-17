import { and, count, desc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { suppliers } from "@/modules/suppliers/schema";
import { broadcastItems, broadcasts } from "./schema";
import type { BroadcastStatus } from "./status";
import type {
  AdminBroadcastSummary,
  BroadcastDetail,
  BroadcastSummary,
  Paginated,
} from "./types";

export const BROADCAST_PAGE_SIZE = 20;
const PREVIEW_LENGTH = 160;

const itemCount = sql<number>`(
  select count(*) from ${broadcastItems}
  where ${broadcastItems.broadcastId} = ${broadcasts.id}
)`.mapWith(Number);

const summaryColumns = {
  id: broadcasts.id,
  status: broadcasts.status,
  preview: sql<string>`left(${broadcasts.rawText}, ${PREVIEW_LENGTH})`,
  itemCount,
  createdAt: broadcasts.createdAt,
};

function pageOf(page: number, total: number) {
  const totalPages = Math.max(1, Math.ceil(total / BROADCAST_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    current,
    totalPages,
    offset: (current - 1) * BROADCAST_PAGE_SIZE,
  };
}

/** One supplier's own broadcasts, newest first. */
export async function listSupplierBroadcasts(
  supplierId: string,
  page: number,
): Promise<Paginated<BroadcastSummary>> {
  const where = eq(broadcasts.supplierId, supplierId);
  const [{ total }] = await db
    .select({ total: count() })
    .from(broadcasts)
    .where(where);
  const { current, totalPages, offset } = pageOf(page, total);

  const rows = await db
    .select(summaryColumns)
    .from(broadcasts)
    .where(where)
    .orderBy(desc(broadcasts.createdAt))
    .limit(BROADCAST_PAGE_SIZE)
    .offset(offset);
  return { rows, page: current, totalPages, total };
}

/** Every broadcast, optionally one status, newest first. */
export async function listBroadcastsForAdmin(
  status: BroadcastStatus | undefined,
  page: number,
): Promise<Paginated<AdminBroadcastSummary>> {
  const where: SQL | undefined = status
    ? eq(broadcasts.status, status)
    : undefined;
  const [{ total }] = await db
    .select({ total: count() })
    .from(broadcasts)
    .where(where);
  const { current, totalPages, offset } = pageOf(page, total);

  const rows = await db
    .select({
      ...summaryColumns,
      supplierName: suppliers.companyName,
      supplierSlug: suppliers.slug,
    })
    .from(broadcasts)
    .innerJoin(suppliers, eq(broadcasts.supplierId, suppliers.id))
    .where(where)
    .orderBy(desc(broadcasts.createdAt))
    .limit(BROADCAST_PAGE_SIZE)
    .offset(offset);
  return { rows, page: current, totalPages, total };
}

export async function countBroadcastsByStatus(): Promise<
  Record<BroadcastStatus, number>
> {
  const rows = await db
    .select({ status: broadcasts.status, total: count() })
    .from(broadcasts)
    .groupBy(broadcasts.status);
  const counts: Record<BroadcastStatus, number> = {
    DRAFT: 0,
    PROCESSING: 0,
    REVIEW: 0,
    PUBLISHED: 0,
    FAILED: 0,
  };
  for (const row of rows) counts[row.status] = row.total;
  return counts;
}

/**
 * A single broadcast. Pass `supplierId` to restrict it to that supplier's own
 * broadcasts; omit it only for staff.
 */
export async function getBroadcast(
  id: string,
  supplierId?: string,
): Promise<BroadcastDetail | undefined> {
  const conditions = [eq(broadcasts.id, id)];
  if (supplierId) conditions.push(eq(broadcasts.supplierId, supplierId));

  const [row] = await db
    .select({
      id: broadcasts.id,
      status: broadcasts.status,
      source: broadcasts.source,
      rawText: broadcasts.rawText,
      itemCount,
      createdAt: broadcasts.createdAt,
      updatedAt: broadcasts.updatedAt,
      publishedAt: broadcasts.publishedAt,
      supplierId: broadcasts.supplierId,
      supplierName: suppliers.companyName,
      supplierSlug: suppliers.slug,
    })
    .from(broadcasts)
    .innerJoin(suppliers, eq(broadcasts.supplierId, suppliers.id))
    .where(and(...conditions))
    .limit(1);
  return row;
}
