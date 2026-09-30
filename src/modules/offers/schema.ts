import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  jsonb,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { suppliers } from "@/modules/suppliers/schema";
import { products } from "@/modules/products/schema";
import { broadcastItems, priceTypeEnum } from "@/modules/broadcasts/schema";

export const availabilityStatusEnum = pgEnum("availability_status", [
  "AVAILABLE",
  "LIMITED",
  "ASK",
  "UNKNOWN",
  "SOLD_OUT",
]);

export const offers = pgTable(
  "offers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    broadcastItemId: uuid("broadcast_item_id")
      .notNull()
      .references(() => broadcastItems.id),
    titleSnapshot: text("title_snapshot"),
    specificationSnapshot: jsonb("specification_snapshot"),
    price: numeric("price"),
    currency: text("currency").default("AED"),
    priceType: priceTypeEnum("price_type"),
    quantity: integer("quantity"),
    availabilityStatus: availabilityStatusEnum("availability_status"),
    lastVerifiedAt: timestamp("last_verified_at"),
    publishedAt: timestamp("published_at"),
    expiresAt: timestamp("expires_at"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("offers_supplier_id_idx").on(table.supplierId),
    index("offers_product_id_idx").on(table.productId),
    index("offers_published_at_idx").on(table.publishedAt),
    index("offers_active_idx").on(table.active),
    uniqueIndex("offers_supplier_product_active_unique_idx")
      .on(table.supplierId, table.productId)
      .where(sql`${table.active} = true`),
  ],
);

export const offerObservations = pgTable(
  "offer_observations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => offers.id),
    price: numeric("price"),
    currency: text("currency"),
    quantity: integer("quantity"),
    availabilityStatus: availabilityStatusEnum("availability_status"),
    observedAt: timestamp("observed_at").notNull().defaultNow(),
    broadcastItemId: uuid("broadcast_item_id")
      .notNull()
      .references(() => broadcastItems.id),
  },
  (table) => [
    index("offer_observations_offer_id_idx").on(table.offerId),
    index("offer_observations_observed_at_idx").on(table.observedAt),
  ],
);
