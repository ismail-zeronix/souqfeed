import type {
  SupplierFormValues,
  SupplierProfile,
  SupplierRecord,
  SupplierRecordWithAssociations,
} from "./types";

/**
 * Builds a public profile from a real database row. Activity metrics have no
 * backing data until Phases 3, 4 and 7, so they stay zero or empty here rather
 * than being borrowed from mock data — a real supplier must never display
 * figures it did not earn.
 */
export function toSupplierProfile(
  row: SupplierRecord,
  associations: { brandNames: string[]; categoryNames: string[] } = {
    brandNames: [],
    categoryNames: [],
  },
): SupplierProfile {
  return {
    id: row.id,
    slug: row.slug,
    companyName: row.companyName,
    logoInitial: row.companyName.trim().charAt(0).toUpperCase() || "?",
    verified: row.verified,
    locationName: row.locationName ?? "—",
    activeOfferCount: 0,
    positiveScorePercent: 0,
    description: row.description,
    whatsappNumber: row.whatsappNumber,
    phone: row.phone,
    email: row.email,
    website: row.website,
    address: row.address,
    googleMapsUrl: row.googleMapsUrl,
    tags: [...associations.categoryNames, ...associations.brandNames],
    lastBroadcastAt: null,
    memberSinceYear: row.createdAt.getFullYear(),
    avgResponseTimeLabel: "—",
    topBrands: [],
    categoryMix: [],
    broadcastActivity: [],
    businessHours: [],
  };
}

export function toSupplierFormValues(
  supplier: SupplierRecordWithAssociations | undefined,
): SupplierFormValues {
  return {
    companyName: supplier?.companyName ?? "",
    whatsappNumber: supplier?.whatsappNumber ?? "",
    description: supplier?.description ?? "",
    phone: supplier?.phone ?? "",
    email: supplier?.email ?? "",
    website: supplier?.website ?? "",
    locationName: supplier?.locationName ?? "",
    address: supplier?.address ?? "",
    googleMapsUrl: supplier?.googleMapsUrl ?? "",
    brandIds: supplier?.brandIds ?? [],
    categoryIds: supplier?.categoryIds ?? [],
  };
}
