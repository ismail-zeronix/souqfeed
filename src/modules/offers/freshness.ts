export type Freshness = "LIVE" | "RECENT" | "STALE" | "VERY_STALE";

const HOUR = 60 * 60 * 1000;

/** How recently an offer was confirmed (docs/data-model.md thresholds). */
export function freshnessOf(
  lastVerifiedAt: Date,
  now: Date = new Date(),
): Freshness {
  const age = now.getTime() - lastVerifiedAt.getTime();
  if (age < 6 * HOUR) return "LIVE";
  if (age < 24 * HOUR) return "RECENT";
  if (age <= 72 * HOUR) return "STALE";
  return "VERY_STALE";
}

export const FRESHNESS_LABELS: Record<Freshness, string> = {
  LIVE: "Live",
  RECENT: "Today",
  STALE: "A few days old",
  VERY_STALE: "Out of date",
};
