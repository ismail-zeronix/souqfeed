import type { FormState } from "@/lib/validation/form";
import type { suppliers } from "./schema";

export type SupplierRecord = typeof suppliers.$inferSelect;

export interface SupplierRecordWithAssociations extends SupplierRecord {
  brandIds: string[];
  categoryIds: string[];
}

export type AdminSupplierRow = Pick<
  SupplierRecord,
  "id" | "slug" | "companyName" | "verified" | "active"
>;

/** Raw form text, so a failed submission can be shown back to the supplier. */
export interface SupplierFormValues {
  companyName: string;
  whatsappNumber: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  locationName: string;
  address: string;
  googleMapsUrl: string;
  brandIds: string[];
  categoryIds: string[];
}

export type SupplierFormState = FormState<SupplierFormValues>;

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
  website?: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  tags: string[];
  lastBroadcastAt: string | null; // null until the supplier has really broadcast (Phase 4)
  memberSinceYear: number;
  avgResponseTimeLabel: string; // placeholder — no backing schema field yet
  topBrands: TopBrandShare[];
  categoryMix: CategoryMixSlice[];
  broadcastActivity: BroadcastActivityDay[];
  businessHours: { day: string; hours: string }[];
}
