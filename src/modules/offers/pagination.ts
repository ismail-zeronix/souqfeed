import type { OfferListItem } from "./types";

export interface PaginatedOffers {
  items: OfferListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function paginateOffers(
  offers: OfferListItem[],
  requestedPage: number,
  pageSize: number,
): PaginatedOffers {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(offers.length / safePageSize));
  const page = Math.min(Math.max(1, Math.floor(requestedPage) || 1), totalPages);
  const start = (page - 1) * safePageSize;

  return {
    items: offers.slice(start, start + safePageSize),
    page,
    pageSize: safePageSize,
    totalItems: offers.length,
    totalPages,
  };
}
