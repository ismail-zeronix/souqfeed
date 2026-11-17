import { extractPrice, extractQuantity } from "./extract-commercial";
import {
  extractBrand,
  extractModel,
  extractPartNumber,
} from "./extract-identity";
import {
  extractCpu,
  extractDisplay,
  extractGpu,
  extractMemory,
  extractOs,
} from "./extract-specs";
import { LineScanner } from "./line-scanner";
import type { ParsedItem } from "./types";

export type LineFields = Omit<ParsedItem, "rawLine" | "rawBlock">;

/**
 * Replaces WhatsApp formatting, emoji, and leading bullets or numbering with
 * spaces. Length is preserved so the scanner's positions stay meaningful.
 */
export function cleanLine(line: string): string {
  const blank = (text: string) => " ".repeat(text.length);
  return line
    .replace(/[*_~`]/g, " ")
    .replace(/\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}️‍⃣]/gu, blank)
    .replace(/^\s*(?:\d{1,3}\s*[.)]|[-•▪►➡→✔✅☑]+)\s+/u, blank);
}

/** Reads every field it can from one line. Order matters: see the plan doc. */
export function parseLine(line: string, brands: readonly string[]): LineFields {
  const scanner = new LineScanner(cleanLine(line));

  const { price, currency, priceType } = extractPrice(scanner);
  const quantity = extractQuantity(scanner);
  const cpu = extractCpu(scanner);
  const gpu = extractGpu(scanner);
  const { ram, storage } = extractMemory(scanner);
  const display = extractDisplay(scanner);
  const os = extractOs(scanner);
  const brand = extractBrand(scanner, brands);
  const { partNumber } = extractPartNumber(scanner);
  const model = extractModel(scanner.remainder());

  return {
    brand,
    model,
    partNumber,
    cpu,
    ram,
    storage,
    gpu,
    display,
    os,
    quantity,
    price,
    currency,
    priceType,
  };
}

const SPEC_KEYS = ["cpu", "ram", "storage", "gpu", "display", "os"] as const;

export function specCount(fields: LineFields): number {
  return SPEC_KEYS.filter((key) => fields[key] !== null).length;
}

/** Says something about price or availability. */
export function hasCommercial(fields: LineFields): boolean {
  return (
    fields.price !== null ||
    fields.quantity !== null ||
    fields.priceType === "ASK"
  );
}
