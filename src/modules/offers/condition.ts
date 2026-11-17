export const OFFER_CONDITIONS = [
  "NEW",
  "OPEN_BOX",
  "REFURBISHED",
  "USED",
] as const;

export type OfferCondition = (typeof OFFER_CONDITIONS)[number];

export const CONDITION_LABELS: Record<OfferCondition, string> = {
  NEW: "New",
  OPEN_BOX: "Open box",
  REFURBISHED: "Refurbished",
  USED: "Used",
};

/** The label for a stored condition; null when not stated. */
export function conditionLabel(value: string | null): string | null {
  return value && value in CONDITION_LABELS
    ? CONDITION_LABELS[value as OfferCondition]
    : null;
}
