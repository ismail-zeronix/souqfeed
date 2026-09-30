export type PriceType = "FIXED" | "ASK" | "HIDDEN" | "UNKNOWN";
export type AvailabilityStatus =
  "AVAILABLE" | "LIMITED" | "ASK" | "UNKNOWN" | "SOLD_OUT";
export type OfferBadge = "NEW" | "LIVE" | "PRICE_UPDATED" | null;

export interface OfferListItem {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierVerified: boolean;
  supplierSlug: string;
  supplierPositiveScorePercent: number; // placeholder — no backing schema field yet
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  locationName: string;
  title: string;
  specLine: string[];
  quantity: number | null;
  price: number | null;
  currency: string;
  priceType: PriceType;
  previousPrice: number | null; // real: derived from the most recent prior offer_observations row
  availabilityStatus: AvailabilityStatus;
  badge: OfferBadge;
  postedAt: string; // ISO timestamp
  whatsappNumber: string;
}

export interface OfferFilterCriteria {
  brandIds: string[];
  categoryIds: string[];
  locationNames: string[];
  inStockOnly: boolean;
  searchQuery: string;
}

export interface MarketStats {
  // placeholder — no backing aggregation query yet; Phase 12 (analytics) computes these for real
  activeSuppliersToday: number;
  activeSuppliersTrendPercent: number;
  offersPostedToday: number;
  offersPostedTrendPercent: number;
  priceUpdatesToday: number;
  priceUpdatesTrendPercent: number;
  newProductsToday: number;
  newProductsTrendPercent: number;
}
