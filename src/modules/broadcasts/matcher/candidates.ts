import {
  and,
  desc,
  eq,
  inArray,
  sql,
  type AnyColumn,
  type SQL,
} from "drizzle-orm";
import { db } from "@/lib/database/client";
import { brands } from "@/modules/brands/schema";
import {
  normalizePartNumber,
  normalizeTitle,
} from "@/modules/products/normalize";
import { productAliases, products } from "@/modules/products/schema";
import type { Candidate, CandidateSets, MatchItem } from "./decide";

const FUZZY_THRESHOLD = 0.5;
const CANDIDATE_LIMIT = 10;

/** SQL twin of `normalizeTitle`: lowercase, non-alphanumerics to spaces, trimmed. */
const normalized = (column: SQL | AnyColumn) =>
  sql`trim(regexp_replace(lower(coalesce(${column}, '')), '[^a-z0-9]+', ' ', 'g'))`;

const candidateColumns = {
  productId: products.id,
  title: products.title,
  brandName: brands.name,
  specifications: products.specifications,
};

function base(...conditions: (SQL | undefined)[]) {
  return db
    .select(candidateColumns)
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .where(and(eq(products.active, true), ...conditions))
    .orderBy(products.title)
    .limit(CANDIDATE_LIMIT);
}

const brandIs = (brand: string | null) =>
  brand ? sql`lower(${brands.name}) = ${brand.toLowerCase()}` : undefined;

/** Looks up the catalog candidates for one parsed item at every level. */
export async function findCandidates(item: MatchItem): Promise<CandidateSets> {
  const model = item.model ? normalizeTitle(item.model) : "";
  const brandAndModel = normalizeTitle(
    [item.brand, item.model].filter(Boolean).join(" "),
  );

  const partNumber: Promise<Candidate[]> = item.partNumber
    ? base(eq(products.partNumber, normalizePartNumber(item.partNumber)))
    : Promise.resolve([]);

  const brandModel: Promise<Candidate[]> =
    item.brand && model
      ? base(
          brandIs(item.brand),
          sql`(${normalized(products.model)} = ${model}
            or ${normalized(products.family)} = ${model}
            or ${products.normalizedTitle} = ${brandAndModel}
            or ${products.normalizedTitle} = ${model})`,
        )
      : Promise.resolve([]);

  const alias: Promise<Candidate[]> = model
    ? db
        .selectDistinct({ id: productAliases.productId })
        .from(productAliases)
        .where(
          sql`${normalized(sql`${productAliases.alias}`)} in (${model}, ${brandAndModel})`,
        )
        .limit(CANDIDATE_LIMIT)
        .then((rows) =>
          rows.length
            ? base(
                inArray(
                  products.id,
                  rows.map((row) => row.id),
                ),
                brandIs(item.brand),
              )
            : [],
        )
    : Promise.resolve([]);

  // Family names are at least 3 characters so "G8" alone never matches.
  const familySpec: Promise<Candidate[]> =
    item.brand && model
      ? base(
          brandIs(item.brand),
          sql`length(${normalized(products.family)}) >= 3`,
          sql`position(${normalized(products.family)} in ${model}) > 0`,
        )
      : Promise.resolve([]);

  const fuzzy: Promise<Candidate[]> =
    item.brand && model
      ? db
          .select({
            ...candidateColumns,
            similarity:
              sql<number>`similarity(${products.normalizedTitle}, ${brandAndModel})`.mapWith(
                Number,
              ),
          })
          .from(products)
          .innerJoin(brands, eq(products.brandId, brands.id))
          .where(
            and(
              eq(products.active, true),
              brandIs(item.brand),
              sql`similarity(${products.normalizedTitle}, ${brandAndModel}) >= ${FUZZY_THRESHOLD}`,
            ),
          )
          .orderBy(
            desc(
              sql`similarity(${products.normalizedTitle}, ${brandAndModel})`,
            ),
          )
          .limit(3)
      : Promise.resolve([]);

  const [a, b, c, d, e] = await Promise.all([
    partNumber,
    brandModel,
    alias,
    familySpec,
    fuzzy,
  ]);
  return { partNumber: a, brandModel: b, alias: c, familySpec: d, fuzzy: e };
}
