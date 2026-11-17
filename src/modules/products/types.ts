import type { FormState } from "@/lib/validation/form";
import type { SpecKey } from "./normalize";

export interface AdminProductRow {
  id: string;
  title: string;
  partNumber: string | null;
  model: string | null;
  active: boolean;
  brandName: string;
  categoryName: string | null;
}

export interface ProductPage {
  rows: AdminProductRow[];
  total: number;
  page: number;
  totalPages: number;
}

export type ProductFormValues = {
  brandId: string;
  categoryId: string;
  title: string;
  family: string;
  model: string;
  partNumber: string;
} & Record<SpecKey, string>;

export type ProductFormState = FormState<ProductFormValues>;
export type AliasFormState = FormState<{ alias: string }>;

export interface ProductForEdit {
  id: string;
  active: boolean;
  values: ProductFormValues;
  aliases: { id: string; alias: string }[];
}
