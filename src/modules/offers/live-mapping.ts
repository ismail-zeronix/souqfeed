import { freshnessOf } from "./freshness";
import type {
  AvailabilityStatus,
  OfferBadge,
  OfferListItem,
  PriceType,
} from "./types";

/** A row from the live-offers query, before it is shaped for the cards. */
export interface LiveOfferRow {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierVerified: boolean;
  supplierSlug: string;
  locationName: string | null;
  whatsappNumber: string;
  brandId: string;
  brandName: string;
  categoryId: string | null;
  categoryName: string | null;
  title: string | null;
  specificationSnapshot: unknown;
  quantity: number | null;
  price: string | null;
  currency: string | null;
  priceType: PriceType | null;
  availabilityStatus: AvailabilityStatus | null;
  lastVerifiedAt: Date | null;
  publishedAt: Date | null;
  previousPrice: string | null;
  observationCount: number;
}

const SPEC_ORDER = ["cpu", "ram", "storage", "gpu", "display", "os"];
const DAY = 24 * 60 * 60 * 1000;

const toNumber = (value: string | null) =>
  value === null || value === "" ? null : Number(value);

/**
 * PRICE_UPDATED when the latest price differs from the one before it; NEW for
 * a first listing in the last day; LIVE when confirmed in the last six hours.
 */
export function badgeFor(row: LiveOfferRow, now: Date): OfferBadge {
  const price = toNumber(row.price);
  const previous = toNumber(row.previousPrice);
  if (price !== null && previous !== null && price !== previous) {
    return "PRICE_UPDATED";
  }
  if (
    row.observationCount <= 1 &&
    row.publishedAt &&
    now.getTime() - row.publishedAt.getTime() < DAY
  ) {
    return "NEW";
  }
  if (row.lastVerifiedAt && freshnessOf(row.lastVerifiedAt, now) === "LIVE") {
    return "LIVE";
  }
  return null;
}

/** Shapes a real offer for the market cards. Unknown stays empty, never invented. */
export function toOfferListItem(row: LiveOfferRow, now: Date): OfferListItem {
  const specs =
    typeof row.specificationSnapshot === "object" && row.specificationSnapshot
      ? (row.specificationSnapshot as Record<string, unknown>)
      : {};
  return {
    id: row.id,
    supplierId: row.supplierId,
    supplierName: row.supplierName,
    supplierVerified: row.supplierVerified,
    supplierSlug: row.supplierSlug,
    // No buyer feedback exists; 0 means "not shown".
    supplierPositiveScorePercent: 0,
    brandId: row.brandId,
    brandName: row.brandName,
    categoryId: row.categoryId ?? "",
    categoryName: row.categoryName ?? "",
    locationName: row.locationName ?? "",
    title: row.title ?? `${row.brandName} product`,
    specLine: SPEC_ORDER.map((key) => specs[key]).filter(
      (value): value is string => typeof value === "string" && value !== "",
    ),
    quantity: row.quantity,
    price: toNumber(row.price),
    currency: row.currency ?? "",
    priceType: row.priceType ?? "UNKNOWN",
    previousPrice: toNumber(row.previousPrice),
    availabilityStatus: row.availabilityStatus ?? "UNKNOWN",
    badge: badgeFor(row, now),
    postedAt: (row.lastVerifiedAt ?? row.publishedAt ?? now).toISOString(),
    whatsappNumber: row.whatsappNumber,
  };
}

/** Percent change from the previous period; 0 when there's nothing to compare. */
export function trendPercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}
