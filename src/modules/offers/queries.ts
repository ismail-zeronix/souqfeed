import { and, count, desc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/database/client";
import type { Paginated } from "@/modules/broadcasts/types";
import { suppliers } from "@/modules/suppliers/schema";
import { offerObservations, offers } from "./schema";

export const OFFER_PAGE_SIZE = 25;

export interface OfferRow {
  id: string;
  title: string | null;
  price: string | null;
  currency: string | null;
  priceType: string | null;
  quantity: number | null;
  availabilityStatus: string | null;
  lastVerifiedAt: Date | null;
  publishedAt: Date | null;
  active: boolean;
  supplierName: string;
  supplierSlug: string;
  observationCount: number;
}

export interface OfferObservationRow {
  id: string;
  price: string | null;
  currency: string | null;
  quantity: number | null;
  availabilityStatus: string | null;
  observedAt: Date;
  broadcastId: string;
}

export interface OfferDetail extends OfferRow {
  supplierId: string;
  supplierUserId: string;
  productId: string;
  specificationSnapshot: unknown;
  observations: OfferObservationRow[];
}

const rowColumns = {
  id: offers.id,
  title: offers.titleSnapshot,
  price: offers.price,
  currency: offers.currency,
  priceType: offers.priceType,
  quantity: offers.quantity,
  availabilityStatus: offers.availabilityStatus,
  lastVerifiedAt: offers.lastVerifiedAt,
  publishedAt: offers.publishedAt,
  active: offers.active,
  supplierName: suppliers.companyName,
  supplierSlug: suppliers.slug,
  observationCount: sql<number>`(
    select count(*) from ${offerObservations}
    where ${offerObservations.offerId} = ${offers.id}
  )`.mapWith(Number),
};

async function list(
  where: SQL | undefined,
  page: number,
): Promise<Paginated<OfferRow>> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(offers)
    .innerJoin(suppliers, eq(offers.supplierId, suppliers.id))
    .where(where);
  const totalPages = Math.max(1, Math.ceil(total / OFFER_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  const rows = await db
    .select(rowColumns)
    .from(offers)
    .innerJoin(suppliers, eq(offers.supplierId, suppliers.id))
    .where(where)
    .orderBy(desc(offers.lastVerifiedAt), desc(offers.createdAt))
    .limit(OFFER_PAGE_SIZE)
    .offset((current - 1) * OFFER_PAGE_SIZE);
  return { rows, page: current, totalPages, total };
}

/** One supplier's offers, most recently confirmed first. */
export function listSupplierOffers(
  supplierId: string,
  active: boolean,
  page: number,
) {
  return list(
    and(eq(offers.supplierId, supplierId), eq(offers.active, active)),
    page,
  );
}

/** Every supplier's offers, for staff. */
export function listOffersForAdmin(active: boolean, page: number) {
  return list(eq(offers.active, active), page);
}

/**
 * One offer with its full price and quantity history. Pass `supplierId` to
 * restrict it to that supplier's own offers.
 */
export async function getOffer(
  id: string,
  supplierId?: string,
): Promise<OfferDetail | undefined> {
  const conditions = [eq(offers.id, id)];
  if (supplierId) conditions.push(eq(offers.supplierId, supplierId));
  const [row] = await db
    .select({
      ...rowColumns,
      supplierId: offers.supplierId,
      supplierUserId: suppliers.userId,
      productId: offers.productId,
      specificationSnapshot: offers.specificationSnapshot,
    })
    .from(offers)
    .innerJoin(suppliers, eq(offers.supplierId, suppliers.id))
    .where(and(...conditions))
    .limit(1);
  if (!row) return undefined;

  const observations = await db
    .select({
      id: offerObservations.id,
      price: offerObservations.price,
      currency: offerObservations.currency,
      quantity: offerObservations.quantity,
      availabilityStatus: offerObservations.availabilityStatus,
      observedAt: offerObservations.observedAt,
      broadcastId: sql<string>`(
        select broadcast_id from broadcast_items
        where broadcast_items.id = ${offerObservations.broadcastItemId}
      )`,
    })
    .from(offerObservations)
    .where(eq(offerObservations.offerId, id))
    .orderBy(desc(offerObservations.observedAt));
  return { ...row, observations };
}

/** The owner check for withdrawing: which user's supplier holds the offer. */
export async function getOfferOwner(
  id: string,
): Promise<{ supplierUserId: string; active: boolean } | undefined> {
  const [row] = await db
    .select({ supplierUserId: suppliers.userId, active: offers.active })
    .from(offers)
    .innerJoin(suppliers, eq(offers.supplierId, suppliers.id))
    .where(eq(offers.id, id))
    .limit(1);
  return row;
}
