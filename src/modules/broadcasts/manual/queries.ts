import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { BRAND_CATEGORY_HINTS } from "@/modules/brands/it-brands";
import { brands } from "@/modules/brands/schema";
import { categories } from "@/modules/categories/schema";
import { offers } from "@/modules/offers/schema";
import { products } from "@/modules/products/schema";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

export interface BrandOption {
  id: string;
  name: string;
  /** Top-level category slugs the brand is known for or has products in. */
  categorySlugs: string[];
}

export interface CatalogProduct {
  id: string;
  title: string;
  partNumber: string | null;
  categoryName: string | null;
  specifications: Record<string, string>;
}

export interface AddOfferOptions {
  categories: CategoryOption[];
  brands: BrandOption[];
}

function stringSpecs(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

/** Categories as two levels (deeper ones are folded into their top level). */
export async function getAddOfferOptions(): Promise<AddOfferOptions> {
  const [categoryRows, brandRows, brandCategoryRows] = await Promise.all([
    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
      })
      .from(categories)
      .orderBy(asc(categories.name)),
    db
      .select({ id: brands.id, name: brands.name, slug: brands.slug })
      .from(brands)
      .orderBy(asc(brands.name)),
    // Which top-level categories each brand already has catalog products in.
    db.execute(sql`
      with recursive tree as (
        select id, id as top_id from categories where parent_id is null
        union all
        select c.id, t.top_id from categories c join tree t on c.parent_id = t.id
      )
      select distinct p.brand_id, top.slug
      from products p
      join tree on tree.id = p.category_id
      join categories top on top.id = tree.top_id
      where p.active = true
    `) as unknown as Promise<{ brand_id: string; slug: string }[]>,
  ]);

  const byId = new Map(categoryRows.map((row) => [row.id, row]));
  const topOf = (id: string) => {
    let row = byId.get(id);
    const seen = new Set<string>();
    while (row?.parentId && byId.has(row.parentId) && !seen.has(row.id)) {
      seen.add(row.id);
      row = byId.get(row.parentId);
    }
    return row;
  };
  const tops = categoryRows
    .filter((row) => !row.parentId || !byId.has(row.parentId))
    .map((row): CategoryOption => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      children: [],
    }));
  const topById = new Map(tops.map((top) => [top.id, top]));
  for (const row of categoryRows) {
    if (!row.parentId || !byId.has(row.parentId)) continue;
    const top = topById.get(topOf(row.id)?.id ?? "");
    top?.children.push({ id: row.id, name: row.name, slug: row.slug });
  }

  const fromCatalog = new Map<string, Set<string>>();
  for (const row of await brandCategoryRows) {
    const set = fromCatalog.get(row.brand_id) ?? new Set<string>();
    set.add(row.slug);
    fromCatalog.set(row.brand_id, set);
  }

  return {
    categories: tops,
    brands: brandRows.map((brand) => ({
      id: brand.id,
      name: brand.name,
      categorySlugs: [
        ...new Set([
          ...(BRAND_CATEGORY_HINTS.get(brand.slug) ?? []),
          ...(fromCatalog.get(brand.id) ?? []),
        ]),
      ],
    })),
  };
}

/**
 * A brand's active catalog products for the add-offer form, those in the
 * chosen category (or below it) first. With no query, the most-offered ones.
 */
export async function searchCatalogForOffer(
  brandId: string,
  categoryId: string | null,
  query: string,
): Promise<CatalogProduct[]> {
  const term = query.trim().slice(0, 100);
  const pattern = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const inCategory = categoryId
    ? sql`${products.categoryId} in (
        with recursive tree as (
          select id from categories where id = ${categoryId}
          union all
          select c.id from categories c join tree t on c.parent_id = t.id
        ) select id from tree)`
    : sql`false`;

  const rows = await db
    .select({
      id: products.id,
      title: products.title,
      partNumber: products.partNumber,
      categoryName: categories.name,
      specifications: products.specifications,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.brandId, brandId),
        eq(products.active, true),
        term
          ? sql`(${products.title} ilike ${pattern} or ${products.partNumber} ilike ${pattern} or ${products.model} ilike ${pattern})`
          : undefined,
      ),
    )
    .orderBy(
      sql`(${inCategory}) desc`,
      term
        ? sql`word_similarity(lower(${term}), ${products.normalizedTitle}) desc`
        : sql`(select count(*) from ${offers} where ${offers.productId} = ${products.id} and ${offers.active}) desc`,
      asc(products.title),
    )
    .limit(term ? 12 : 8);

  return rows.map((row) => ({
    ...row,
    specifications: stringSpecs(row.specifications),
  }));
}

export interface OfferPrefill {
  product: { id: string; title: string; partNumber: string | null };
  brandId: string;
  brandName: string;
  categoryId: string | null;
  condition: string | null;
  price: string | null;
  currency: string | null;
  priceType: string | null;
  quantity: number | null;
  warranty: string | null;
  notes: string | null;
}

/** An offer of this supplier's, to prefill "update price & stock". */
export async function getOfferPrefill(
  offerId: string,
  supplierId: string,
): Promise<OfferPrefill | undefined> {
  const [row] = await db
    .select({
      productId: products.id,
      title: products.title,
      partNumber: products.partNumber,
      brandId: brands.id,
      brandName: brands.name,
      categoryId: products.categoryId,
      condition: offers.condition,
      price: offers.price,
      currency: offers.currency,
      priceType: offers.priceType,
      quantity: offers.quantity,
      warranty: offers.warranty,
      notes: offers.notes,
    })
    .from(offers)
    .innerJoin(products, eq(offers.productId, products.id))
    .innerJoin(brands, eq(products.brandId, brands.id))
    .where(
      and(
        eq(offers.id, offerId),
        eq(offers.supplierId, supplierId),
        eq(products.active, true),
      ),
    )
    .limit(1);
  if (!row) return undefined;
  return {
    product: {
      id: row.productId,
      title: row.title,
      partNumber: row.partNumber,
    },
    brandId: row.brandId,
    brandName: row.brandName,
    categoryId: row.categoryId,
    condition: row.condition,
    price: row.price,
    currency: row.currency,
    priceType: row.priceType,
    quantity: row.quantity,
    warranty: row.warranty,
    notes: row.notes,
  };
}

/** The slug of a category's top-level ancestor (itself if top-level). */
export async function topLevelSlugOf(
  categoryId: string,
): Promise<string | null> {
  const rows = (await db.execute(sql`
    with recursive up as (
      select id, parent_id, slug, 0 as depth from categories where id = ${categoryId}
      union all
      select c.id, c.parent_id, c.slug, up.depth + 1
      from categories c join up on c.id = up.parent_id
      where up.depth < 10
    )
    select slug from up order by depth desc limit 1
  `)) as unknown as { slug: string }[];
  return rows[0]?.slug ?? null;
}

/** The offer a published form broadcast created or updated. */
export async function offerForBroadcast(
  broadcastId: string,
): Promise<string | undefined> {
  const rows = (await db.execute(sql`
    select o.id from offers o
    join broadcast_items bi on bi.id = o.broadcast_item_id
    where bi.broadcast_id = ${broadcastId}
    limit 1
  `)) as unknown as { id: string }[];
  return rows[0]?.id;
}
