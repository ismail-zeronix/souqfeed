export type PriceType = "FIXED" | "ASK" | "HIDDEN" | "UNKNOWN";

/** What one product line (or multi-line block) said. Unknown means null. */
export interface ParsedItem {
  rawLine: string;
  /** All the lines this item was read from, when it spans more than one. */
  rawBlock: string | null;
  brand: string | null;
  model: string | null;
  partNumber: string | null;
  cpu: string | null;
  ram: string | null;
  storage: string | null;
  gpu: string | null;
  display: string | null;
  os: string | null;
  quantity: number | null;
  price: number | null;
  currency: string | null;
  priceType: PriceType;
}

export interface ParsedBroadcast {
  items: ParsedItem[];
  /** Non-blank lines that held no product information. */
  skippedLines: number;
}

export interface ParserContext {
  /** Canonical brand names, e.g. from the brands table. */
  brands: readonly string[];
}

/**
 * Seam for future parsers (AI-assisted, hybrid). Only the rule-based one is
 * built for MVP; see docs/broadcast-parsing.md.
 */
export interface BroadcastParser {
  parse(rawText: string, context: ParserContext): ParsedBroadcast;
}
