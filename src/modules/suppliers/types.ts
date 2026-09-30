export interface SupplierSummary {
  id: string;
  slug: string;
  companyName: string;
  logoInitial: string;
  verified: boolean;
  locationName: string;
  activeOfferCount: number;
  positiveScorePercent: number; // placeholder — no backing schema field yet
}

export interface TopBrandShare {
  brandId: string;
  brandName: string;
  sharePercent: number;
}

export interface CategoryMixSlice {
  categoryId: string;
  categoryName: string;
  sharePercent: number; // placeholder — no backing schema field yet (category-mix chart deferred)
}

export interface BroadcastActivityDay {
  label: string;
  count: number; // placeholder — no backing schema field yet (broadcast-activity chart deferred)
}

export interface SupplierProfile extends SupplierSummary {
  description: string | null;
  whatsappNumber: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  tags: string[];
  lastBroadcastAt: string;
  memberSinceYear: number;
  avgResponseTimeLabel: string; // placeholder — no backing schema field yet
  topBrands: TopBrandShare[];
  categoryMix: CategoryMixSlice[];
  broadcastActivity: BroadcastActivityDay[];
  businessHours: { day: string; hours: string }[];
}
