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
  check,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { suppliers } from "@/modules/suppliers/schema";
import { products } from "@/modules/products/schema";
import {
  broadcastItems,
  offerConditionEnum,
  priceTypeEnum,
} from "@/modules/broadcasts/schema";

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
    condition: offerConditionEnum("condition"),
    warranty: text("warranty"),
    notes: text("notes"),
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
    check("offers_warranty_length", sql`char_length(${table.warranty}) <= 80`),
    check("offers_notes_length", sql`char_length(${table.notes}) <= 1000`),
    // Condition is part of an offer's identity: the same model can be listed
    // new and refurbished. Migration 0009 adds NULLS NOT DISTINCT by hand
    // (Drizzle can't express it on an index), so "not stated" counts as one
    // condition and still allows only one active offer.
    uniqueIndex("offers_supplier_product_condition_active_unique_idx")
      .on(table.supplierId, table.productId, table.condition)
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
