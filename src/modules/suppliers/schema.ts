import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "@/modules/auth/schema";
import { brands } from "@/modules/brands/schema";
import { categories } from "@/modules/categories/schema";

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id),
  companyName: text("company_name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  description: text("description"),
  whatsappNumber: text("whatsapp_number").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  locationName: text("location_name"),
  address: text("address"),
  googleMapsUrl: text("google_maps_url"),
  verified: boolean("verified").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const supplierBrands = pgTable(
  "supplier_brands",
  {
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
  },
  (table) => [primaryKey({ columns: [table.supplierId, table.brandId] })],
);

export const supplierCategories = pgTable(
  "supplier_categories",
  {
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (table) => [primaryKey({ columns: [table.supplierId, table.categoryId] })],
);
