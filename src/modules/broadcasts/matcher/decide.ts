import { compareSpecs, type ItemSpecs } from "./specs";

export type MatchMethod =
  | "PART_NUMBER"
  | "BRAND_MODEL"
  | "ALIAS"
  | "BRAND_FAMILY_SPEC"
  | "FUZZY"
  | "MANUAL"
  | "NONE";

export interface Candidate {
  productId: string;
  title: string;
  brandName: string;
  specifications: unknown;
  /** pg_trgm similarity, for fuzzy candidates only. */
  similarity?: number;
}

export interface CandidateSets {
  partNumber: Candidate[];
  brandModel: Candidate[];
  alias: Candidate[];
  familySpec: Candidate[];
  /** Most similar first. */
  fuzzy: Candidate[];
}

export interface MatchItem extends ItemSpecs {
  brand: string | null;
  model: string | null;
  partNumber: string | null;
}

export interface MatchResult {
  productId: string | null;
  confidence: number;
  method: MatchMethod;
  reasons: string[];
  reviewStatus: "AUTO_APPROVED" | "NEEDS_REVIEW";
}

export const AUTO_APPROVE_AT = 0.9;
const AMBIGUOUS_CONFIDENCE = 0.6;
const CONFLICT_CAP = 0.7;
const FUZZY_WEIGHT = 0.8;

const round = (value: number) => Math.round(value * 100) / 100;

function result(
  productId: string | null,
  confidence: number,
  method: MatchMethod,
  reasons: string[],
): MatchResult {
  const rounded = round(confidence);
  return {
    productId,
    confidence: rounded,
    method,
    reasons,
    reviewStatus: rounded >= AUTO_APPROVE_AT ? "AUTO_APPROVED" : "NEEDS_REVIEW",
  };
}

/**
 * Picks one candidate. With several, specs choose only when exactly one
 * candidate agrees best and none conflict; otherwise the first is merely a
 * suggestion that a person must confirm.
 */
function pick(
  item: MatchItem,
  candidates: Candidate[],
  base: number,
): { candidate: Candidate; confidence: number; reasons: string[] } {
  if (candidates.length === 1) {
    return { candidate: candidates[0], confidence: base, reasons: [] };
  }
  const scored = candidates
    .map((candidate) => ({
      candidate,
      comparison: compareSpecs(item, candidate.specifications),
    }))
    .filter(({ comparison }) => comparison.conflicts.length === 0)
    .sort(
      (a, b) => b.comparison.agreements.length - a.comparison.agreements.length,
    );

  const [best, second] = scored;
  if (
    best &&
    best.comparison.agreements.length > 0 &&
    (!second ||
      best.comparison.agreements.length > second.comparison.agreements.length)
  ) {
    return {
      candidate: best.candidate,
      confidence: base - 0.02,
      reasons: [`Chosen from ${candidates.length} products by matching specs`],
    };
  }
  return {
    candidate: candidates[0],
    confidence: AMBIGUOUS_CONFIDENCE,
    reasons: [
      `${candidates.length} catalog products fit; check that this is the right one`,
    ],
  };
}

/** Decides an item's match from the candidates found at each level. */
export function decideMatch(item: MatchItem, sets: CandidateSets): MatchResult {
  const sameBrand = (candidate: Candidate) =>
    !item.brand ||
    candidate.brandName.toLowerCase() === item.brand.toLowerCase();
  const describe = [item.brand, item.model].filter(Boolean).join(" ");

  const levels: [MatchMethod, Candidate[], number, string][] = [
    [
      "PART_NUMBER",
      sets.partNumber,
      0.98,
      `Exact part number match: ${item.partNumber}`,
    ],
    [
      "BRAND_MODEL",
      sets.brandModel,
      0.92,
      `Brand and model match: ${describe}`,
    ],
    ["ALIAS", sets.alias, 0.9, `Known alias match: ${describe}`],
    [
      "BRAND_FAMILY_SPEC",
      sets.familySpec,
      0.75,
      `Product family appears in "${describe}"`,
    ],
  ];

  for (const [method, all, base, reason] of levels) {
    const candidates = all.filter(sameBrand);
    if (candidates.length === 0) continue;
    const chosen = pick(item, candidates, base);
    return withSpecs(item, chosen.candidate, chosen.confidence, method, [
      reason,
      ...chosen.reasons,
    ]);
  }

  const fuzzy = sets.fuzzy.filter(sameBrand)[0];
  if (fuzzy?.similarity !== undefined) {
    return withSpecs(item, fuzzy, fuzzy.similarity * FUZZY_WEIGHT, "FUZZY", [
      `Similar title (${Math.round(fuzzy.similarity * 100)}% alike): ${fuzzy.title}`,
    ]);
  }

  return result(null, 0, "NONE", ["No catalog product matched"]);
}

function withSpecs(
  item: MatchItem,
  candidate: Candidate,
  confidence: number,
  method: MatchMethod,
  reasons: string[],
): MatchResult {
  const { agreements, conflicts } = compareSpecs(
    item,
    candidate.specifications,
  );
  const all = [...reasons];
  if (agreements.length > 0) all.push(`Specs agree: ${agreements.join(", ")}`);
  all.push(...conflicts);
  return result(
    candidate.productId,
    conflicts.length > 0 ? Math.min(confidence, CONFLICT_CAP) : confidence,
    method,
    all,
  );
}
