import type { FormState } from "@/lib/validation/form";

export interface Category {
  id: string;
  name: string;
  slug: string;
  offerCount: number;
}

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  depth: number;
  childCount: number;
  productCount: number;
  supplierCount: number;
}

export type CategoryFormState = FormState<{ name: string; parentId: string }>;
