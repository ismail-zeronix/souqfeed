import { describe, expect, it } from "vitest";
import { paginateOffers } from "./pagination";
import type { OfferListItem } from "./types";

const offers = Array.from({ length: 13 }, (_, index) => ({
  id: `offer-${index + 1}`,
})) as OfferListItem[];

describe("paginateOffers", () => {
  it("returns the requested page and total page metadata", () => {
    expect(paginateOffers(offers, 2, 6)).toEqual({
      items: offers.slice(6, 12),
      page: 2,
      pageSize: 6,
      totalItems: 13,
      totalPages: 3,
    });
  });

  it("clamps invalid pages and never returns an empty first page", () => {
    expect(paginateOffers(offers, 0, 6).page).toBe(1);
    expect(paginateOffers(offers, 99, 6)).toMatchObject({
      items: offers.slice(12),
      page: 3,
      totalPages: 3,
    });
  });
});
