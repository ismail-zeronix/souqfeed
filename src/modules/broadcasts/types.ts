import type { FormState } from "@/lib/validation/form";
import type { BroadcastStatus } from "./status";

export type BroadcastFormState = FormState<{ rawText: string }>;

export interface BroadcastSummary {
  id: string;
  status: BroadcastStatus;
  preview: string;
  itemCount: number;
  createdAt: Date;
}

export interface AdminBroadcastSummary extends BroadcastSummary {
  supplierName: string;
  supplierSlug: string;
}

export interface BroadcastDetail {
  id: string;
  status: BroadcastStatus;
  statusNote: string | null;
  source: string;
  rawText: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  supplierId: string;
  supplierName: string;
  supplierSlug: string;
}

export interface BroadcastItemRow {
  id: string;
  position: number;
  rawLine: string;
  rawBlock: string | null;
  brand: string | null;
  model: string | null;
  partNumber: string | null;
  cpu: string | null;
  ram: string | null;
  storage: string | null;
  gpu: string | null;
  display: string | null;
  os: string | null;
  quantity: number | null;
  price: string | null;
  currency: string | null;
  priceType: string | null;
  matchedProductId: string | null;
  matchedProductTitle: string | null;
  matchConfidence: string | null;
  matchMethod: string | null;
  matchReasons: unknown;
  reviewStatus: string | null;
}

export interface Paginated<Row> {
  rows: Row[];
  page: number;
  totalPages: number;
  total: number;
}
