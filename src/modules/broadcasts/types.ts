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

export interface Paginated<Row> {
  rows: Row[];
  page: number;
  totalPages: number;
  total: number;
}
