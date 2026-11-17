import { and, count, eq, exists, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { brands } from "@/modules/brands/schema";
import { categories } from "@/modules/categories/schema";
import {
  PRODUCT_PAGE_SIZE,
  toContainsPattern,
  type ProductFilters,
} from "./filters";
import { normalizeTitle, readSpec, SPEC_FIELDS } from "./normalize";
import { productAliases, products } from "./schema";
import type { ProductForEdit, ProductFormValues, ProductPage } from "./types";

function buildWhere(filters: ProductFilters): SQL | undefined {
  const conditions: (SQL | undefined)[] = [];
  if (filters.brandId) conditions.push(eq(products.brandId, filters.brandId));
  if (filters.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  if (filters.query) {
    const pattern = toContainsPattern(filters.query);
    const normalized = normalizeTitle(filters.query);
    conditions.push(
      or(
        ilike(products.title, pattern),
        normalized
          ? ilike(products.normalizedTitle, toContainsPattern(normalized))
          : undefined,
        ilike(products.partNumber, pattern),
        ilike(products.model, pattern),
        ilike(products.family, pattern),
        exists(
          db
            .select({ id: productAliases.id })
            .from(productAliases)
            .where(
              and(
                eq(productAliases.productId, products.id),
                ilike(productAliases.alias, pattern),
              ),
            ),
        ),
      ),
    );
  }
  return and(...conditions);
}

export async function listProductsForAdmin(
  filters: ProductFilters,
): Promise<ProductPage> {
  const where = buildWhere(filters);
  const [{ total }] = await db
    .select({ total: count() })
    .from(products)
    .where(where);
  const totalPages = Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);

  const rows = await db
    .select({
      id: products.id,
      title: products.title,
      partNumber: products.partNumber,
      model: products.model,
      active: products.active,
      brandName: brands.name,
      categoryName: categories.name,
    })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(where)
    .orderBy(products.title, products.id)
    .limit(PRODUCT_PAGE_SIZE)
    .offset((page - 1) * PRODUCT_PAGE_SIZE);

  return { rows, total, page, totalPages };
}

export const EMPTY_PRODUCT_VALUES: ProductFormValues = {
  brandId: "",
  categoryId: "",
  title: "",
  family: "",
  model: "",
  partNumber: "",
  cpu: "",
  ram: "",
  storage: "",
  gpu: "",
  display: "",
  os: "",
};

export async function getProductForEdit(
  id: string,
): Promise<ProductForEdit | undefined> {
  const [row] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!row) return undefined;

  const aliases = await db
    .select({ id: productAliases.id, alias: productAliases.alias })
    .from(productAliases)
    .where(eq(productAliases.productId, id))
    .orderBy(productAliases.alias);

  const values: ProductFormValues = {
    ...EMPTY_PRODUCT_VALUES,
    brandId: row.brandId,
    categoryId: row.categoryId ?? "",
    title: row.title,
    family: row.family ?? "",
    model: row.model ?? "",
    partNumber: row.partNumber ?? "",
  };
  for (const { key } of SPEC_FIELDS) {
    values[key] = readSpec(row.specifications, key);
  }

  return { id: row.id, active: row.active, values, aliases };
}
