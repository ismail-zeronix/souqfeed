import { sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { FRESHNESS_WINDOWS, queryForms, type SearchFilters } from "./params";

export const SEARCH_PAGE_SIZE = 20;
/** word_similarity: how well the query matches the closest stretch of the title. */
const FUZZY_THRESHOLD = 0.5;

export interface SearchOffer {
  id: string;
  supplierName: string;
  supplierSlug: string;
  supplierVerified: boolean;
  locationName: string | null;
  whatsappNumber: string;
  price: string | null;
  currency: string | null;
  priceType: string | null;
  quantity: number | null;
  availabilityStatus: string | null;
  lastVerifiedAt: Date | null;
}

export interface SearchGroup {
  productId: string;
  title: string;
  brandName: string;
  partNumber: string | null;
  categoryName: string | null;
  /** Which ranking tier matched (1 = part number … 7 = fuzzy), 0 when browsing. */
  tier: number;
  supplierCount: number;
  offers: SearchOffer[];
}

export interface SearchResult {
  groups: SearchGroup[];
  total: number;
  page: number;
  totalPages: number;
}

const norm = (value: SQL) =>
  sql`trim(regexp_replace(lower(coalesce(${value}, '')), '[^a-z0-9]+', ' ', 'g'))`;

/** Conditions on an offer (alias `o`) and its supplier (alias `s`). */
function offerConditions(filters: SearchFilters): SQL {
  const parts: SQL[] = [sql`o.active = true`, sql`s.active = true`];
  if (filters.supplierSlug) parts.push(sql`s.slug = ${filters.supplierSlug}`);
  if (filters.location) parts.push(sql`s.location_name = ${filters.location}`);
  if (filters.price === "fixed") parts.push(sql`o.price is not null`);
  if (filters.price === "ask") parts.push(sql`o.price_type = 'ASK'`);
  if (filters.availableOnly)
    parts.push(sql`o.availability_status = 'AVAILABLE'`);
  if (filters.fresh) {
    parts.push(
      sql`o.last_verified_at > now() - make_interval(hours => ${FRESHNESS_WINDOWS[filters.fresh]})`,
    );
  }
  return sql.join(parts, sql` and `);
}

/**
 * Products with matching offers, ranked by the tiers in docs/search.md, one
 * page at a time, each with its matching offers.
 */
export async function searchProducts(
  filters: SearchFilters,
): Promise<SearchResult> {
  const forms = queryForms(filters.query);
  const browsing = forms.tsQuery === null;
  const offerWhere = offerConditions(filters);

  const productFilters: SQL[] = [sql`p.active = true`];
  if (filters.brandId)
    productFilters.push(sql`p.brand_id = ${filters.brandId}`);
  if (filters.categoryId) {
    productFilters.push(sql`p.category_id = ${filters.categoryId}`);
  }

  const tsQuery = sql`to_tsquery('simple', ${forms.tsQuery ?? ""})`;
  const doc = sql`concat_ws(' ', c.title, c.brand_name, c.family, c.model,
    c.part_number, c.category_name, c.aliases, c.specifications::text, c.offer_specs)`;
  const tier = browsing
    ? sql`0`
    : sql`case
        when c.part_number = ${forms.partNumber} then 1
        when ${norm(sql`c.model`)} = ${forms.normalized}
          or ${norm(sql`c.brand_name || ' ' || c.model`)} = ${forms.normalized} then 2
        when exists (
          select 1 from product_aliases a where a.product_id = c.id
            and (${norm(sql`a.alias`)} = ${forms.normalized}
              or ${norm(sql`c.brand_name || ' ' || a.alias`)} = ${forms.normalized})
        ) then 3
        when lower(c.brand_name) = ${forms.normalized} then 4
        when to_tsvector('simple', c.title) @@ ${tsQuery} then 5
        when to_tsvector('simple', ${doc}) @@ ${tsQuery} then 6
        when word_similarity(${forms.normalized}, c.normalized_title) >= ${FUZZY_THRESHOLD} then 7
      end`;
  const rank = browsing
    ? sql`0`
    : sql`ts_rank(to_tsvector('simple', ${doc}), ${tsQuery})`;
  const similarity = browsing
    ? sql`0`
    : sql`word_similarity(${forms.normalized}, c.normalized_title)`;

  const offset = (filters.page - 1) * SEARCH_PAGE_SIZE;
  const rows = (await db.execute(sql`
    with candidates as (
      select p.id, p.title, p.normalized_title, p.part_number, p.model, p.family,
        p.specifications, b.name as brand_name, cat.name as category_name,
        (select string_agg(a.alias, ' ') from product_aliases a where a.product_id = p.id) as aliases,
        string_agg(distinct o.specification_snapshot::text, ' ') as offer_specs,
        count(distinct o.supplier_id)::int as supplier_count,
        max(o.last_verified_at) as latest
      from products p
      join brands b on b.id = p.brand_id
      left join categories cat on cat.id = p.category_id
      join offers o on o.product_id = p.id
      join suppliers s on s.id = o.supplier_id
      where ${sql.join(productFilters, sql` and `)} and ${offerWhere}
      group by p.id, b.name, cat.name
    ),
    scored as (
      select c.id, c.title, c.brand_name, c.part_number, c.category_name,
        c.supplier_count, c.latest,
        ${tier} as tier, ${rank} as rank, ${similarity} as sim
      from candidates c
    )
    -- The count comes back even when the page is past the end.
    select r.*, t.total
    from (select count(*)::int as total from scored where tier is not null) t
    left join lateral (
      select * from scored
      where tier is not null
      order by tier, rank desc, sim desc, latest desc nulls last, title
      limit ${SEARCH_PAGE_SIZE} offset ${offset}
    ) r on true
  `)) as unknown as {
    id: string | null;
    title: string;
    brand_name: string;
    part_number: string | null;
    category_name: string | null;
    supplier_count: number;
    tier: number;
    total: number;
  }[];

  const total = rows[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE));
  const pageRows = rows.flatMap((row) =>
    row.id === null ? [] : [{ ...row, id: row.id }],
  );
  if (pageRows.length === 0) {
    return { groups: [], total, page: filters.page, totalPages };
  }

  const ids = pageRows.map((row) => row.id);
  const offerRows = (await db.execute(sql`
    select o.id, o.product_id, s.company_name, s.slug, s.verified, s.location_name,
      s.whatsapp_number, o.price, o.currency, o.price_type, o.quantity,
      o.availability_status, o.last_verified_at
    from offers o
    join suppliers s on s.id = o.supplier_id
    where o.product_id in (${sql.join(
      ids.map((id) => sql`${id}`),
      sql`, `,
    )}) and ${offerWhere}
    order by o.last_verified_at desc nulls last, o.price asc nulls last
  `)) as unknown as {
    id: string;
    product_id: string;
    company_name: string;
    slug: string;
    verified: boolean;
    location_name: string | null;
    whatsapp_number: string;
    price: string | null;
    currency: string | null;
    price_type: string | null;
    quantity: number | null;
    availability_status: string | null;
    last_verified_at: string | Date | null;
  }[];

  const offersByProduct = new Map<string, SearchOffer[]>();
  for (const row of offerRows) {
    const list = offersByProduct.get(row.product_id) ?? [];
    list.push({
      id: row.id,
      supplierName: row.company_name,
      supplierSlug: row.slug,
      supplierVerified: row.verified,
      locationName: row.location_name,
      whatsappNumber: row.whatsapp_number,
      price: row.price,
      currency: row.currency,
      priceType: row.price_type,
      quantity: row.quantity,
      availabilityStatus: row.availability_status,
      // Raw queries return timestamps without a zone; they are stored in UTC.
      lastVerifiedAt: row.last_verified_at
        ? new Date(
            typeof row.last_verified_at === "string"
              ? `${row.last_verified_at.replace(" ", "T")}Z`
              : row.last_verified_at,
          )
        : null,
    });
    offersByProduct.set(row.product_id, list);
  }

  return {
    groups: pageRows.map((row) => ({
      productId: row.id,
      title: row.title,
      brandName: row.brand_name,
      partNumber: row.part_number,
      categoryName: row.category_name,
      tier: Number(row.tier),
      supplierCount: row.supplier_count,
      offers: offersByProduct.get(row.id) ?? [],
    })),
    total,
    page: filters.page,
    totalPages,
  };
}

export interface SearchFacets {
  suppliers: { slug: string; name: string }[];
  locations: string[];
}

/** Suppliers and locations that currently have visible offers. */
export async function listSearchFacets(): Promise<SearchFacets> {
  const rows = (await db.execute(sql`
    select distinct s.slug, s.company_name, s.location_name
    from offers o join suppliers s on s.id = o.supplier_id
    where o.active = true and s.active = true
    order by s.company_name
  `)) as unknown as {
    slug: string;
    company_name: string;
    location_name: string | null;
  }[];
  return {
    suppliers: rows.map((row) => ({ slug: row.slug, name: row.company_name })),
    locations: [
      ...new Set(
        rows
          .map((row) => row.location_name)
          .filter((value): value is string => Boolean(value)),
      ),
    ].sort(),
  };
}
