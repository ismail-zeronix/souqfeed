import { normalizePartNumber } from "@/modules/products/normalize";
import type { LineScanner } from "./line-scanner";

/**
 * Product family names that belong to exactly one brand. The family stays in
 * the model text ("EliteBook 840 G8"); only the brand is inferred from it.
 */
const FAMILY_BRANDS: Record<string, string> = {
  ELITEBOOK: "HP",
  PROBOOK: "HP",
  ZBOOK: "HP",
  ELITEDESK: "HP",
  PRODESK: "HP",
  ELITEONE: "HP",
  PAVILION: "HP",
  ENVY: "HP",
  SPECTRE: "HP",
  OMEN: "HP",
  VICTUS: "HP",
  OMNIBOOK: "HP",
  LATITUDE: "Dell",
  OPTIPLEX: "Dell",
  PRECISION: "Dell",
  VOSTRO: "Dell",
  INSPIRON: "Dell",
  XPS: "Dell",
  ALIENWARE: "Dell",
  THINKPAD: "Lenovo",
  THINKBOOK: "Lenovo",
  THINKCENTRE: "Lenovo",
  THINKSTATION: "Lenovo",
  IDEAPAD: "Lenovo",
  IDEACENTRE: "Lenovo",
  LEGION: "Lenovo",
  YOGA: "Lenovo",
  MACBOOK: "Apple",
  IMAC: "Apple",
  IPAD: "Apple",
  IPHONE: "Apple",
  ZENBOOK: "Asus",
  VIVOBOOK: "Asus",
  EXPERTBOOK: "Asus",
  ASPIRE: "Acer",
  NITRO: "Acer",
  PREDATOR: "Acer",
  TRAVELMATE: "Acer",
  EXTENSA: "Acer",
  SURFACE: "Microsoft",
};

/** Other spellings of a brand name, removed from the model like the name. */
const BRAND_ALIASES: Record<string, string> = {
  "HEWLETT PACKARD": "HP",
  "HEWLETT-PACKARD": "HP",
  "WESTERN DIGITAL": "WD",
};

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const word = (text: string) =>
  new RegExp(
    String.raw`(?<![A-Z0-9])${escape(text.toUpperCase())}(?![A-Z0-9])`,
  );

/**
 * The brand named earliest in the line: a known brand name, an alias, or a
 * family name. Brand names and aliases are removed from the model text.
 */
export function extractBrand(
  scanner: LineScanner,
  brands: readonly string[],
): string | null {
  const canonical = (name: string) =>
    brands.find((brand) => brand.toUpperCase() === name.toUpperCase()) ?? name;

  type Candidate = {
    index: number;
    brand: string;
    match: RegExpExecArray;
    consume: boolean;
  };
  const candidates: Candidate[] = [];
  const consider = (text: string, brand: string, consume: boolean) => {
    const match = scanner.find(word(text));
    if (match)
      candidates.push({
        index: match.index,
        brand: canonical(brand),
        match,
        consume,
      });
  };

  for (const brand of brands) consider(brand, brand, true);
  for (const [alias, brand] of Object.entries(BRAND_ALIASES))
    consider(alias, brand, true);
  for (const [family, brand] of Object.entries(FAMILY_BRANDS))
    consider(family, brand, false);
  if (candidates.length === 0) return null;

  // Earliest wins; at the same position a brand name beats a family name.
  candidates.sort(
    (a, b) => a.index - b.index || Number(b.consume) - Number(a.consume),
  );
  const chosen = candidates[0];
  if (chosen.consume) scanner.claim(chosen.match);
  return chosen.brand;
}

const LABELLED_PART_NUMBER =
  /(?:P\s*\/\s*N|(?<![A-Z])PN|PART\s*(?:NO\.?|NUMBER|#)|SKU|MPN)\s*[:#.\-]?\s*([A-Z0-9][A-Z0-9#\-\/]{3,24})/;

const TOKEN =
  /(?<![A-Z0-9#\-\/])([A-Z0-9]+(?:-[A-Z0-9]+)*(?:#[A-Z0-9]{3})?)(?![A-Z0-9#\-\/])/;

/** True for a token shaped like a manufacturer part number, e.g. 21U20063GR, 6A1Q9EA#ABV. */
export function looksLikePartNumber(token: string): boolean {
  const core = token.split("#")[0].replaceAll("-", "");
  if (core.length < 6 || core.length > 20) return false;
  const digits = core.replace(/\D/g, "").length;
  const letters = core.replace(/[^A-Z]/g, "").length;
  if (digits < 3 || letters < 2) return false;
  // Generations and capacities, not part numbers.
  if (
    /^(?:GEN|G)\d+$/.test(core) ||
    /^\d+(?:GB|TB|MHZ|GHZ|HZ|MAH|W)$/.test(core)
  ) {
    return false;
  }
  return true;
}

export interface PartNumberResult {
  partNumber: string | null;
  /** Labelled part numbers are removed from the model; unlabelled stay in it. */
  labelled: boolean;
}

export function extractPartNumber(scanner: LineScanner): PartNumberResult {
  const labelled = scanner.take(LABELLED_PART_NUMBER);
  if (labelled) {
    return { partNumber: normalizePartNumber(labelled[1]), labelled: true };
  }
  for (const match of scanner.findAll(TOKEN)) {
    if (looksLikePartNumber(match[1])) {
      return { partNumber: normalizePartNumber(match[1]), labelled: false };
    }
  }
  return { partNumber: null, labelled: false };
}

/** Words that describe a listing, not the product: colour, keyboard, condition, stock. */
const NOISE = new RegExp(
  String.raw`(?<![A-Za-z0-9])(?:ENG(?:LISH)?(?:\s*\/\s*(?:ARB|ARABIC|AR))?|ARB|ARABIC|AR\s*\/\s*EN|KEYBOARD|KB|SILVER|SIL|BLACK|BLK|GREY|GRAY|WHITE|BLUE|BRAND\s*NEW|NEW|BOX\s*PACK(?:ED)?|SEALED|OPEN\s*BOX|USED|REFURB(?:ISHED)?|READY\s*STOCK|IN\s*STOCK|STOCK|AVAILABLE|AVL|LAPTOPS?|NOTEBOOKS?)(?![A-Za-z0-9])`,
  "gi",
);

/** The model is whatever the extractors left, minus noise and separators. */
export function extractModel(remainder: string): string | null {
  const model = remainder
    .replace(NOISE, " ")
    .replace(/[|,;:()[\]{}<>!?=*_~•▪►➡→—–]+/g, " ")
    // A hyphen or slash only survives between two word characters (840-G8).
    .replace(/(?<![A-Za-z0-9])[-/]+|[-/]+(?![A-Za-z0-9])/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!model || !/[A-Za-z0-9]/.test(model)) return null;
  return model.length <= 120 ? model : null;
}
