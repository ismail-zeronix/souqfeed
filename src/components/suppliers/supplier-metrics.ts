/** A score of 0 means "no data yet", not "nobody was happy", so it shows a dash. */
export function formatPositiveScore(percent: number): string {
  return percent > 0 ? `${percent}%` : "—";
}

export function formatTenure(
  memberSinceYear: number,
  currentYear: number,
): string {
  const years = currentYear - memberSinceYear;
  return years > 0 ? `${years}+ years` : "New";
}
