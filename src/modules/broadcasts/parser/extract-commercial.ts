import type { LineScanner } from "./line-scanner";
import type { PriceType } from "./types";

// 1850, 1,850, 1850.50
const NUM = String.raw`(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)`;
const AED = String.raw`AED|DHS?|DIRHAMS?`;
const USD = String.raw`USD|US\$|\$`;
const END = String.raw`(?![\d.,]*\d)`;

const PRICE_PATTERNS: { pattern: RegExp; currencyGroup?: number }[] = [
  // AED 1850 / DHS: 1,850 / $500
  {
    pattern: new RegExp(
      String.raw`(?<![A-Z])(${AED}|${USD})\s*[:.\-]?\s*${NUM}${END}`,
    ),
    currencyGroup: 1,
  },
  // 1850 AED / 1850/- / 500$
  {
    pattern: new RegExp(
      String.raw`(?<![\d.,])${NUM}\s*(${AED}|${USD}|\/-)(?![A-Z])`,
    ),
    currencyGroup: 2,
  },
  // @1850 / @ AED 1850
  {
    pattern: new RegExp(String.raw`@\s*(?:(${AED}|${USD})\s*)?${NUM}${END}`),
    currencyGroup: 1,
  },
  // PRICE: 1850 / RATE 1850 AED
  {
    pattern: new RegExp(
      String.raw`(?:PRICE|RATE)\s*[:=\-]?\s*(?:(${AED}|${USD})\s*)?${NUM}${END}`,
    ),
    currencyGroup: 1,
  },
];

const ASK_PATTERN =
  /(?<![A-Z])(ASK|CALL(?:\s+FOR\s+PRICE)?|BEST\s+PRICE|PRICE\s+ON\s+REQUEST|P\.?O\.?R\.?|PM|DM|INBOX)(?![A-Z])/;

function toCurrency(marker: string | undefined): string {
  if (!marker) return "AED";
  return /USD|\$/.test(marker) ? "USD" : "AED";
}

function toNumber(text: string): number {
  return Number(text.replaceAll(",", ""));
}

export interface PriceResult {
  price: number | null;
  currency: string | null;
  priceType: PriceType;
}

/**
 * A stated price, or ASK when the line says to ask. Currency defaults to AED,
 * the market's convention, only when a price was actually found.
 */
export function extractPrice(scanner: LineScanner): PriceResult {
  for (const { pattern, currencyGroup } of PRICE_PATTERNS) {
    const match = scanner.find(pattern);
    if (!match) continue;
    const numberText = match
      .slice(1)
      .find((group) => group && /\d/.test(group));
    const price = numberText ? toNumber(numberText) : NaN;
    if (!(price > 0 && price < 10_000_000)) continue;
    scanner.claim(match);
    return {
      price,
      currency: toCurrency(currencyGroup ? match[currencyGroup] : undefined),
      priceType: "FIXED",
    };
  }
  if (scanner.take(ASK_PATTERN)) {
    return { price: null, currency: null, priceType: "ASK" };
  }
  return { price: null, currency: null, priceType: "UNKNOWN" };
}

const QUANTITY_PATTERNS: { pattern: RegExp; caseSensitive?: boolean }[] = [
  // QTY100 / QTY: 100 / QUANTITY 100. First, so "16/512 QTY100" isn't "512 QTY".
  { pattern: /(?:QTY|QUANTITY)\s*[:=\-]?\s*(\d{1,6})(?!\d)/ },
  // 100PCS / 100 PCS / 20 units / 50NOS / 50 QTY
  {
    pattern:
      /(?<![\d.])(\d{1,6})\s*(?:PCS|PC|PIECES?|UNITS?|NOS|QTY|QTYS)(?![A-Z])/,
  },
  // x20 / × 20 (lower-case x only, so "X1 Carbon" stays a model)
  {
    pattern: /(?<![A-Za-z0-9])[x×]\s?(\d{1,6})(?![\dA-Za-z])/,
    caseSensitive: true,
  },
];

export function extractQuantity(scanner: LineScanner): number | null {
  for (const { pattern, caseSensitive } of QUANTITY_PATTERNS) {
    const match = scanner.find(pattern, caseSensitive);
    if (!match) continue;
    const quantity = Number(match[1]);
    if (quantity < 1 || quantity > 1_000_000) continue;
    scanner.claim(match);
    return quantity;
  }
  return null;
}
