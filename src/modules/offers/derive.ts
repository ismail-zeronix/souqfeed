import type { AvailabilityStatus, PriceType } from "./types";

/**
 * What a published item says about availability, without inventing anything:
 * a stated quantity means available; ask-only pricing with no quantity means
 * ask; anything else is unknown.
 */
export function availabilityFor(item: {
  quantity: number | null;
  priceType: PriceType | null;
}): AvailabilityStatus {
  if (item.quantity !== null && item.quantity > 0) return "AVAILABLE";
  if (item.priceType === "ASK") return "ASK";
  return "UNKNOWN";
}

const SPEC_KEYS = ["cpu", "ram", "storage", "gpu", "display", "os"] as const;

/**
 * The offer's specs: what the supplier stated, with the product's stored
 * specs filling only the keys the supplier didn't mention. Null if neither
 * says anything.
 */
export function specificationSnapshot(
  stated: Partial<Record<(typeof SPEC_KEYS)[number], string | null>>,
  productSpecs: unknown,
): Record<string, string> | null {
  const product =
    typeof productSpecs === "object" && productSpecs !== null
      ? (productSpecs as Record<string, unknown>)
      : {};
  const snapshot: Record<string, string> = {};
  for (const key of SPEC_KEYS) {
    const value = stated[key] ?? product[key];
    if (typeof value === "string" && value.trim()) snapshot[key] = value;
  }
  return Object.keys(snapshot).length > 0 ? snapshot : null;
}
