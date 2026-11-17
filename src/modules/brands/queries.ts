import { count } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { products } from "@/modules/products/schema";
import { supplierBrands } from "@/modules/suppliers/schema";
import { brands } from "./schema";
import type { AdminBrandRow, Brand } from "./types";

export async function listBrands(): Promise<Brand[]> {
  return db
    .select({ id: brands.id, name: brands.name, slug: brands.slug })
    .from(brands)
    .orderBy(brands.name);
}

export async function listBrandsForAdmin(): Promise<AdminBrandRow[]> {
  const [rows, productCounts, supplierCounts] = await Promise.all([
    listBrands(),
    db
      .select({ id: products.brandId, total: count() })
      .from(products)
      .groupBy(products.brandId),
    db
      .select({ id: supplierBrands.brandId, total: count() })
      .from(supplierBrands)
      .groupBy(supplierBrands.brandId),
  ]);
  const productsBy = new Map(productCounts.map((row) => [row.id, row.total]));
  const suppliersBy = new Map(supplierCounts.map((row) => [row.id, row.total]));

  return rows.map((brand) => ({
    ...brand,
    productCount: productsBy.get(brand.id) ?? 0,
    supplierCount: suppliersBy.get(brand.id) ?? 0,
  }));
}
