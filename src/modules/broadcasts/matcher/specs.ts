/** The detected specs a match is checked against. */
export interface ItemSpecs {
  cpu: string | null;
  ram: string | null;
  storage: string | null;
}

export interface SpecComparison {
  agreements: string[];
  conflicts: string[];
}

/** Capacity in GB from text like "16GB", "1TB", "512 GB SSD"; null if none. */
export function capacityInGb(text: string): number | null {
  const match = /(\d+(?:\.\d+)?)\s*(TB|GB|T)\b/i.exec(text);
  if (!match) return null;
  const amount = Number(match[1]);
  return /^T/i.test(match[2]) ? amount * 1024 : amount;
}

/**
 * The model-number part of a CPU name ("1235U", "N305", "155H", "M2"), which
 * is what identifies it. Null when the text names only a family ("Core i5").
 */
export function cpuModelToken(text: string): string | null {
  const upper = text.toUpperCase();
  const match =
    /(?<![A-Z0-9])(\d{4,5}[A-Z]{0,2}\d?|N\d{3}|\d{3}[A-Z]{1,2})(?![A-Z0-9])/.exec(
      upper,
    ) ??
    /(?<![A-Z0-9])(M[1-5](?:\s*(?:PRO|MAX|ULTRA))?)(?![A-Z0-9])/.exec(upper);
  return match ? match[1].replace(/\s+/g, " ") : null;
}

function stringSpec(
  specs: Record<string, unknown>,
  key: string,
): string | null {
  const value = specs[key];
  return typeof value === "string" && value.trim() ? value : null;
}

/**
 * Compares an item's detected specs with a product's stored ones. A spec
 * only counts when both sides state it; anything unknown is neither an
 * agreement nor a conflict.
 */
export function compareSpecs(
  item: ItemSpecs,
  productSpecs: unknown,
): SpecComparison {
  const result: SpecComparison = { agreements: [], conflicts: [] };
  if (typeof productSpecs !== "object" || productSpecs === null) return result;
  const specs = productSpecs as Record<string, unknown>;

  const productCpu = stringSpec(specs, "cpu");
  if (item.cpu && productCpu) {
    const a = cpuModelToken(item.cpu);
    const b = cpuModelToken(productCpu);
    if (a && b) {
      (a === b ? result.agreements : result.conflicts).push(
        a === b ? `CPU ${a}` : `CPU differs: ${item.cpu} vs ${productCpu}`,
      );
    }
  }

  for (const [key, label] of [
    ["ram", "RAM"],
    ["storage", "Storage"],
  ] as const) {
    const productValue = stringSpec(specs, key);
    const itemValue = item[key];
    if (!itemValue || !productValue) continue;
    const a = capacityInGb(itemValue);
    const b = capacityInGb(productValue);
    if (a === null || b === null) continue;
    if (a === b) result.agreements.push(`${label} ${itemValue}`);
    else
      result.conflicts.push(
        `${label} differs: ${itemValue} vs ${productValue}`,
      );
  }

  return result;
}
