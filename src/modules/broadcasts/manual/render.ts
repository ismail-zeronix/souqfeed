import { specLabel, type SpecField } from "@/modules/categories/spec-templates";
import { CONDITION_LABELS } from "@/modules/offers/condition";
import type { ManualOfferInput } from "./validation";

/** 1850 → "1,850"; 1850.5 → "1,850.50". */
function formatAmount(amount: number): string {
  return amount.toLocaleString("en-AE", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * The broadcast text for a form submission: exactly what the supplier
 * entered, one fact per line, so the evidence behind the offer reads like any
 * other broadcast. Stored once and never changed (Rule 8).
 */
export function renderManualOffer(
  input: ManualOfferInput,
  product: { brandName: string; title: string; partNumber: string | null },
  /** The category's fields, so specs carry the labels the supplier saw. */
  template: SpecField[] = [],
): { rawText: string; rawLine: string } {
  const labelOf = (key: string) =>
    template.find((field) => field.key === key)?.label ?? specLabel(key);
  const headline = input.productId
    ? [
        product.title.toLowerCase().startsWith(product.brandName.toLowerCase())
          ? product.title
          : `${product.brandName} ${product.title}`,
        product.partNumber && `(${product.partNumber})`,
      ]
    : [
        product.brandName,
        input.model,
        input.partNumber && `(${input.partNumber})`,
      ];
  const rawLine = headline.filter(Boolean).join(" ");

  const specs = [
    ...Object.entries(input.specs),
    ...Object.entries(input.extraSpecs),
  ].map(([key, value]) => `${labelOf(key)}: ${value}`);

  const lines = [
    rawLine,
    specs.length > 0 && `Specs: ${specs.join("; ")}`,
    input.condition && `Condition: ${CONDITION_LABELS[input.condition]}`,
    input.priceType === "ASK"
      ? "Price: Ask"
      : `Price: ${input.currency} ${formatAmount(input.price ?? 0)}`,
    input.quantity !== null && `Quantity: ${input.quantity}`,
    input.warranty && `Warranty: ${input.warranty}`,
    input.notes && `Notes: ${input.notes}`,
  ];
  return { rawText: lines.filter(Boolean).join("\n"), rawLine };
}
