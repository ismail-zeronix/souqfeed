import { describe, expect, it } from "vitest";
import { getMobileFeedOffers } from "./mobile-feed-data";
import type { OfferListItem } from "@/modules/offers/types";

const offer = (id: string, categoryId: string): OfferListItem => ({
  id,
  supplierId: "supplier",
  supplierName: "Supplier",
  supplierVerified: true,
  supplierSlug: "supplier",
  supplierPositiveScorePercent: 95,
  brandId: "brand",
  brandName: "Brand",
  categoryId,
  categoryName: "Category",
  locationName: "Bur Dubai",
  title: id,
  specLine: ["16GB"],
  quantity: 10,
  price: 100,
  currency: "AED",
  priceType: "FIXED",
  previousPrice: null,
  availabilityStatus: "AVAILABLE",
  badge: null,
  postedAt: new Date().toISOString(),
  whatsappNumber: "+971500000000",
});

describe("getMobileFeedOffers", () => {
  it("filters by category and keeps the mobile list compact", () => {
    const offers = Array.from({ length: 8 }, (_, index) =>
      offer(`offer-${index}`, index === 0 ? "laptops" : "storage"),
    );

    expect(
      getMobileFeedOffers(offers, { categoryIds: ["laptops"] }).map(
        (item) => item.id,
      ),
    ).toEqual(["offer-0"]);
    expect(getMobileFeedOffers(offers, {}).length).toBe(6);
  });
});
