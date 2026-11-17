import {
  hasCommercial,
  parseLine,
  specCount,
  type LineFields,
} from "./parse-line";
import type {
  BroadcastParser,
  ParsedBroadcast,
  ParsedItem,
  ParserContext,
} from "./types";

export const MAX_ITEMS_PER_BROADCAST = 500;

/** Fields a later line may fill in, but never overwrite. */
const DETAIL_KEYS = [
  "partNumber",
  "cpu",
  "ram",
  "storage",
  "gpu",
  "display",
  "os",
  "quantity",
  "price",
] as const;

interface Draft {
  lines: string[];
  fields: LineFields;
}

function isProduct(fields: LineFields): boolean {
  return (
    specCount(fields) > 0 || hasCommercial(fields) || fields.partNumber !== null
  );
}

/** A later line describes a different product if it restates a detail. */
function conflicts(draft: Draft, line: LineFields): boolean {
  return DETAIL_KEYS.some(
    (key) => draft.fields[key] !== null && line[key] !== null,
  );
}

function merge(draft: Draft, rawLine: string, line: LineFields): void {
  draft.lines.push(rawLine);
  const fields = draft.fields;
  for (const key of DETAIL_KEYS) {
    if (fields[key] === null && line[key] !== null) {
      (fields as Record<string, unknown>)[key] = line[key];
    }
  }
  if (fields.price === null && line.priceType !== "UNKNOWN") {
    fields.priceType = line.priceType;
  }
  if (line.price !== null) fields.currency = line.currency;
}

function toItem(draft: Draft): ParsedItem {
  return {
    rawLine: draft.lines[0],
    rawBlock: draft.lines.length > 1 ? draft.lines.join("\n") : null,
    ...draft.fields,
  };
}

/**
 * Deterministic parser for pasted WhatsApp stock broadcasts. Blank lines
 * separate blocks. Within a block, a line naming a brand starts an item and
 * following lines without one add details to it; a brand line that never gets
 * details is a section header, whose brand later lines in the block inherit.
 */
export class RuleBasedBroadcastParser implements BroadcastParser {
  parse(rawText: string, context: ParserContext): ParsedBroadcast {
    const items: ParsedItem[] = [];
    let skippedLines = 0;
    let current: Draft | null = null;
    let blockBrand: string | null = null;

    const flush = () => {
      if (current) {
        if (!isProduct(current.fields)) skippedLines += current.lines.length;
        else if (items.length < MAX_ITEMS_PER_BROADCAST) {
          items.push(toItem(current));
        }
      }
      current = null;
    };

    for (const rawLine of rawText.split(/\r\n|\r|\n/)) {
      if (items.length >= MAX_ITEMS_PER_BROADCAST) break;
      if (!rawLine.trim()) {
        flush();
        blockBrand = null;
        continue;
      }

      const line = parseLine(rawLine, context.brands);
      const draft = current as Draft | null;

      if (line.brand) {
        flush();
        blockBrand = line.brand;
        current = { lines: [rawLine], fields: line };
        continue;
      }

      const describesProduct = isProduct(line);
      if (draft && describesProduct) {
        const headerOnly = !isProduct(draft.fields);
        // A new model under a section header, or a restated detail, is a
        // separate product that keeps the block's brand.
        if ((headerOnly && line.model) || conflicts(draft, line)) {
          flush();
          current = {
            lines: [rawLine],
            fields: { ...line, brand: blockBrand },
          };
        } else {
          merge(draft, rawLine, line);
        }
        continue;
      }

      if (
        !draft &&
        specCount(line) >= 1 &&
        (hasCommercial(line) || specCount(line) >= 2)
      ) {
        current = { lines: [rawLine], fields: { ...line, brand: blockBrand } };
        continue;
      }

      skippedLines += 1;
    }
    flush();

    return { items, skippedLines };
  }
}
