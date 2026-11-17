export const SPEC_FIELDS = [
  { key: "cpu", label: "CPU" },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "gpu", label: "GPU" },
  { key: "display", label: "Display" },
  { key: "os", label: "OS" },
] as const;

export type SpecKey = (typeof SPEC_FIELDS)[number]["key"];

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** The matcher compares part numbers exactly, so spacing and case must not differ. */
export function normalizePartNumber(partNumber: string): string {
  return partNumber.replace(/\s+/g, "").toUpperCase();
}

export function normalizeAlias(alias: string): string {
  return alias.trim().replace(/\s+/g, " ");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Applies the form's values over what's stored. A blank field removes the key,
 * so unknown stays absent (Rule 10), while keys the form doesn't manage survive.
 * Returns null when nothing is left.
 */
export function mergeSpecifications(
  existing: unknown,
  submitted: Record<SpecKey, string | null>,
): Record<string, unknown> | null {
  const merged: Record<string, unknown> = isPlainObject(existing)
    ? { ...existing }
    : {};
  for (const { key } of SPEC_FIELDS) {
    const value = submitted[key];
    if (value) {
      merged[key] = value;
    } else {
      delete merged[key];
    }
  }
  return Object.keys(merged).length > 0 ? merged : null;
}

/** Reads a stored spec for the form, ignoring anything that isn't text. */
export function readSpec(specifications: unknown, key: SpecKey): string {
  if (!isPlainObject(specifications)) return "";
  const value = specifications[key];
  return typeof value === "string" ? value : "";
}
