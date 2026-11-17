import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { brands } from "@/modules/brands/schema";
import { broadcasts } from "@/modules/broadcasts/schema";
import { categories } from "@/modules/categories/schema";
import { products } from "@/modules/products/schema";
import { suppliers } from "@/modules/suppliers/schema";
import type { SupplierSummary } from "@/modules/suppliers/types";
import { toOfferListItem, trendPercent } from "./live-mapping";
import { offerObservations, offers } from "./schema";
import type { MarketStats, OfferListItem } from "./types";

/** Offers buyers can see: active, from a supplier SouqFeed hasn't hidden. */
const visible = and(eq(offers.active, true), eq(suppliers.active, true));

/** Visible offers, and how many suppliers they come from. */
export async function countLiveOffers(): Promise<{
  offers: number;
  suppliers: number;
}> {
  const [row] = await db
    .select({
      offers: count(),
      suppliers: sql<number>`count(distinct ${offers.supplierId})`.mapWith(
        Number,
      ),
    })
    .from(offers)
    .innerJoin(suppliers, eq(offers.supplierId, suppliers.id))
    .where(visible);
  return row;
}

/** The newest-confirmed visible offers, shaped for the market cards. */
export async function listLiveOffers(limit = 500): Promise<OfferListItem[]> {
  const rows = await db
    .select({
      id: offers.id,
      supplierId: offers.supplierId,
      supplierName: suppliers.companyName,
      supplierVerified: suppliers.verified,
      supplierSlug: suppliers.slug,
      locationName: suppliers.locationName,
      whatsappNumber: suppliers.whatsappNumber,
      brandId: products.brandId,
      brandName: brands.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      title: offers.titleSnapshot,
      specificationSnapshot: offers.specificationSnapshot,
      quantity: offers.quantity,
      price: offers.price,
      currency: offers.currency,
      priceType: offers.priceType,
      availabilityStatus: offers.availabilityStatus,
      lastVerifiedAt: offers.lastVerifiedAt,
      publishedAt: offers.publishedAt,
      previousPrice: sql<string | null>`(
        select ${offerObservations.price} from ${offerObservations}
        where ${offerObservations.offerId} = ${offers.id}
        order by ${offerObservations.observedAt} desc
        offset 1 limit 1
      )`,
      observationCount: sql<number>`(
        select count(*) from ${offerObservations}
        where ${offerObservations.offerId} = ${offers.id}
      )`.mapWith(Number),
    })
    .from(offers)
    .innerJoin(suppliers, eq(offers.supplierId, suppliers.id))
    .innerJoin(products, eq(offers.productId, products.id))
    .innerJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(visible)
    .orderBy(desc(offers.lastVerifiedAt))
    .limit(limit);
  const now = new Date();
  return rows.map((row) => toOfferListItem(row, now));
}

/** Counts in the last 24 hours, with the change from the 24 hours before. */
export async function getLiveMarketStats(): Promise<MarketStats> {
  const window = (column: unknown, from: number, to: number) =>
    sql`${column} > now() - make_interval(hours => ${from}) and ${column} <= now() - make_interval(hours => ${to})`;
  const twoDays = (column: unknown) =>
    [
      sql<number>`count(*) filter (where ${window(column, 24, 0)})`.mapWith(
        Number,
      ),
      sql<number>`count(*) filter (where ${window(column, 48, 24)})`.mapWith(
        Number,
      ),
    ] as const;

  const [supplierCounts, offerCounts, updateCounts, productCounts] =
    await Promise.all([
      db
        .select({
          today:
            sql<number>`count(distinct ${broadcasts.supplierId}) filter (where ${window(broadcasts.publishedAt, 24, 0)})`.mapWith(
              Number,
            ),
          before:
            sql<number>`count(distinct ${broadcasts.supplierId}) filter (where ${window(broadcasts.publishedAt, 48, 24)})`.mapWith(
              Number,
            ),
        })
        .from(broadcasts)
        .where(eq(broadcasts.status, "PUBLISHED")),
      db
        .select({
          today: twoDays(offers.publishedAt)[0],
          before: twoDays(offers.publishedAt)[1],
        })
        .from(offers),
      db
        .select({
          today: twoDays(offerObservations.observedAt)[0],
          before: twoDays(offerObservations.observedAt)[1],
        })
        .from(offerObservations),
      db
        .select({
          today: twoDays(products.createdAt)[0],
          before: twoDays(products.createdAt)[1],
        })
        .from(products),
    ]);

  const [s] = supplierCounts;
  const [o] = offerCounts;
  const [u] = updateCounts;
  const [p] = productCounts;
  return {
    activeSuppliersToday: s.today,
    activeSuppliersTrendPercent: trendPercent(s.today, s.before),
    offersPostedToday: o.today,
    offersPostedTrendPercent: trendPercent(o.today, o.before),
    priceUpdatesToday: u.today,
    priceUpdatesTrendPercent: trendPercent(u.today, u.before),
    newProductsToday: p.today,
    newProductsTrendPercent: trendPercent(p.today, p.before),
  };
}

/** Offer updates per day for the last `days` days in Dubai time, oldest first. */
export async function getMarketActivity(days = 7): Promise<number[]> {
  const rows = await db
    .select({
      day: sql<string>`to_char((${offerObservations.observedAt} at time zone 'UTC') at time zone 'Asia/Dubai', 'YYYY-MM-DD')`,
      total: count(),
    })
    .from(offerObservations)
    .where(
      sql`${offerObservations.observedAt} > now() - make_interval(days => ${days})`,
    )
    .groupBy(sql`1`);
  const byDay = new Map(rows.map((row) => [row.day, row.total]));
  const dubaiDay = (offset: number) =>
    new Date(Date.now() - offset * 86_400_000).toLocaleDateString("en-CA", {
      timeZone: "Asia/Dubai",
    });
  return Array.from(
    { length: days },
    (_, i) => byDay.get(dubaiDay(days - 1 - i)) ?? 0,
  );
}

/** Suppliers with the most visible offers. */
export async function listTopSuppliers(limit = 4): Promise<SupplierSummary[]> {
  const rows = await db
    .select({
      id: suppliers.id,
      slug: suppliers.slug,
      companyName: suppliers.companyName,
      verified: suppliers.verified,
      locationName: suppliers.locationName,
      activeOfferCount: count(),
    })
    .from(offers)
    .innerJoin(suppliers, eq(offers.supplierId, suppliers.id))
    .where(visible)
    .groupBy(suppliers.id)
    .orderBy(desc(count()), suppliers.companyName)
    .limit(limit);
  return rows.map((row) => ({
    ...row,
    logoInitial: row.companyName.charAt(0).toUpperCase(),
    locationName: row.locationName ?? "",
    positiveScorePercent: 0,
  }));
}

/** Visible offers per category id. */
export async function countLiveOffersByCategory(): Promise<
  Map<string, number>
> {
  const rows = await db
    .select({ categoryId: products.categoryId, total: count() })
    .from(offers)
    .innerJoin(suppliers, eq(offers.supplierId, suppliers.id))
    .innerJoin(products, eq(offers.productId, products.id))
    .where(visible)
    .groupBy(products.categoryId);
  // Roll subcategory counts up into their top-level category.
  const parents = await db
    .select({ id: categories.id, parentId: categories.parentId })
    .from(categories);
  const parentOf = new Map(parents.map((row) => [row.id, row.parentId]));
  const topOf = (id: string) => {
    let current = id;
    for (let depth = 0; depth < 10; depth += 1) {
      const parent = parentOf.get(current);
      if (!parent) break;
      current = parent;
    }
    return current;
  };
  const totals = new Map<string, number>();
  for (const row of rows) {
    if (row.categoryId === null) continue;
    const top = topOf(row.categoryId);
    totals.set(top, (totals.get(top) ?? 0) + row.total);
  }
  return totals;
}
