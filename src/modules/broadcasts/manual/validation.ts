import { z } from "zod";
import { optionalText } from "@/lib/validation/form";
import {
  OFFER_CONDITIONS,
  type OfferCondition,
} from "@/modules/offers/condition";
import { normalizePartNumber } from "@/modules/products/normalize";
import {
  isDetectedSpecKey,
  type DetectedSpecKey,
  type SpecField,
} from "@/modules/categories/spec-templates";

export const OFFER_CURRENCIES = ["AED", "USD"] as const;

export const MAX_NOTES_LENGTH = 1000;
export const MAX_WARRANTY_LENGTH = 80;
const MAX_SPEC_LENGTH = 120;
const MAX_PRICE = 10_000_000;
const MAX_QUANTITY = 1_000_000;

const uuidOrNull = z
  .union([z.literal(""), z.uuid()])
  .optional()
  .transform((value) => value || null);

const baseSchema = z.object({
  categoryId: uuidOrNull,
  brandId: z.uuid("Choose a brand"),
  productId: uuidOrNull,
  model: optionalText(120),
  partNumber: optionalText(80).transform((value) =>
    value ? normalizePartNumber(value) : null,
  ),
  condition: z
    .union([z.literal(""), z.enum(OFFER_CONDITIONS)])
    .optional()
    .transform((value) => value || null),
  priceMode: z.enum(["fixed", "ask"]),
  price: z.string().trim().optional(),
  currency: z.enum(OFFER_CURRENCIES, "Choose a currency"),
  quantity: z.string().trim().optional(),
  warranty: optionalText(MAX_WARRANTY_LENGTH),
  notes: optionalText(MAX_NOTES_LENGTH),
});

export interface ManualOfferInput {
  /** Required when describing a product; optional for a catalog product. */
  categoryId: string | null;
  brandId: string;
  productId: string | null;
  model: string | null;
  partNumber: string | null;
  /** Stated specs in the detected columns. */
  specs: Partial<Record<DetectedSpecKey, string>>;
  /** Stated category-specific specs. */
  extraSpecs: Record<string, string>;
  condition: OfferCondition | null;
  /** Null with priceType ASK. */
  price: number | null;
  currency: (typeof OFFER_CURRENCIES)[number];
  priceType: "FIXED" | "ASK";
  quantity: number | null;
  warranty: string | null;
  notes: string | null;
}

export type ManualOfferParse =
  | { ok: true; data: ManualOfferInput }
  | { ok: false; fieldErrors: Record<string, string> };

function parseAmount(text: string | undefined): number | null | "invalid" {
  if (!text) return null;
  const cleaned = text.replace(/[,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return "invalid";
  return Number(cleaned);
}

/**
 * Reads the add-offer form. Spec fields arrive as `spec_<key>` and only keys
 * in the category's template are kept, so nothing else reaches the database.
 */
export function parseManualOffer(
  values: Record<string, string>,
  template: SpecField[],
): ManualOfferParse {
  const fieldErrors: Record<string, string> = {};
  const parsed = baseSchema.safeParse(values);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? "_form")] ??= issue.message;
    }
    return { ok: false, fieldErrors };
  }
  const input = parsed.data;

  if (!input.productId && !input.categoryId) {
    fieldErrors.categoryId = "Choose a category";
  }
  if (!input.productId && !input.model) {
    fieldErrors.model = "Enter the model, or choose a product from the catalog";
  }

  const specs: Partial<Record<DetectedSpecKey, string>> = {};
  const extraSpecs: Record<string, string> = {};
  if (!input.productId) {
    for (const field of template) {
      const value = (values[`spec_${field.key}`] ?? "").trim();
      if (!value) continue;
      if (value.length > MAX_SPEC_LENGTH) {
        fieldErrors[`spec_${field.key}`] =
          `Must be ${MAX_SPEC_LENGTH} characters or fewer`;
      } else if (isDetectedSpecKey(field.key)) {
        specs[field.key] = value;
      } else {
        extraSpecs[field.key] = value;
      }
    }
  }

  let price: number | null = null;
  if (input.priceMode === "fixed") {
    const amount = parseAmount(input.price);
    if (amount === null) fieldErrors.price = "Enter a price, or choose Ask";
    else if (amount === "invalid" || amount <= 0 || amount > MAX_PRICE) {
      fieldErrors.price = "Enter a price like 1850 or 1,850.50";
    } else price = amount;
  }

  let quantity: number | null = null;
  const qty = parseAmount(input.quantity);
  if (qty === "invalid" || (qty !== null && !Number.isInteger(qty))) {
    fieldErrors.quantity = "Enter a whole number";
  } else if (qty !== null && (qty < 1 || qty > MAX_QUANTITY)) {
    fieldErrors.quantity = "Enter a quantity from 1, or leave it empty";
  } else quantity = qty;

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    data: {
      categoryId: input.categoryId,
      brandId: input.brandId,
      productId: input.productId,
      model: input.productId ? null : input.model,
      partNumber: input.productId ? null : input.partNumber,
      specs,
      extraSpecs,
      condition: input.condition,
      price,
      currency: input.currency,
      priceType: input.priceMode === "fixed" ? "FIXED" : "ASK",
      quantity,
      warranty: input.warranty,
      notes: input.notes,
    },
  };
}
