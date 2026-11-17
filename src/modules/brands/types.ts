import type { FormState } from "@/lib/validation/form";

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface AdminBrandRow extends Brand {
  productCount: number;
  supplierCount: number;
}

export type BrandFormState = FormState<{ name: string }>;
