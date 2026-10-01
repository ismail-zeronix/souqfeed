import {
  pgTable,
  uuid,
  text,
  jsonb,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { brands } from "@/modules/brands/schema";
import { categories } from "@/modules/categories/schema";

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    categoryId: uuid("category_id").references(() => categories.id),
    family: text("family"),
    model: text("model"),
    partNumber: text("part_number"),
    title: text("title").notNull(),
    normalizedTitle: text("normalized_title").notNull(),
    specifications: jsonb("specifications"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("products_brand_id_idx").on(table.brandId),
    index("products_category_id_idx").on(table.categoryId),
    index("products_part_number_idx").on(table.partNumber),
  ],
);

export const productAliases = pgTable(
  "product_aliases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    alias: text("alias").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("product_aliases_product_id_idx").on(table.productId),
    index("product_aliases_alias_idx").on(table.alias),
  ],
);
