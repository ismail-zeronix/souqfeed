import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  jsonb,
  timestamp,
  pgEnum,
  index,
  check,
} from "drizzle-orm/pg-core";
import { suppliers } from "@/modules/suppliers/schema";
import { categories } from "@/modules/categories/schema";
import { products } from "@/modules/products/schema";

export const broadcastStatusEnum = pgEnum("broadcast_status", [
  "DRAFT",
  "PROCESSING",
  "REVIEW",
  "PUBLISHED",
  "FAILED",
]);

export const broadcastSourceEnum = pgEnum("broadcast_source", [
  "MANUAL",
  "WHATSAPP",
  "EMAIL",
  "API",
  // Entered through the add-offer form; raw_text renders what was submitted.
  "FORM",
]);

export const priceTypeEnum = pgEnum("price_type", [
  "FIXED",
  "ASK",
  "HIDDEN",
  "UNKNOWN",
]);

export const offerConditionEnum = pgEnum("offer_condition", [
  "NEW",
  "OPEN_BOX",
  "REFURBISHED",
  "USED",
]);

export const matchMethodEnum = pgEnum("match_method", [
  "PART_NUMBER",
  "SKU",
  "BRAND_MODEL",
  "ALIAS",
  "BRAND_FAMILY_SPEC",
  "FUZZY",
  "AI",
  "NONE",
  // Chosen by a person during review.
  "MANUAL",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "AUTO_APPROVED",
  "NEEDS_REVIEW",
  "APPROVED",
  "REJECTED",
]);

export const broadcasts = pgTable(
  "broadcasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    rawText: text("raw_text").notNull(),
    status: broadcastStatusEnum("status").notNull().default("DRAFT"),
    source: broadcastSourceEnum("source").notNull().default("MANUAL"),
    /** Why a broadcast is FAILED, shown to the supplier. */
    statusNote: text("status_note"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("broadcasts_supplier_id_idx").on(table.supplierId),
    index("broadcasts_created_at_idx").on(table.createdAt),
    index("broadcasts_status_idx").on(table.status),
  ],
);

export const broadcastItems = pgTable(
  "broadcast_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    broadcastId: uuid("broadcast_id")
      .notNull()
      .references(() => broadcasts.id),
    /** Order within the broadcast, from 0, so items list in source order. */
    position: integer("position").notNull().default(0),
    rawLine: text("raw_line").notNull(),
    rawBlock: text("raw_block"),

    detectedBrand: text("detected_brand"),
    detectedModel: text("detected_model"),
    detectedPartNumber: text("detected_part_number"),
    detectedCPU: text("detected_cpu"),
    detectedRAM: text("detected_ram"),
    detectedStorage: text("detected_storage"),
    detectedGPU: text("detected_gpu"),
    detectedDisplay: text("detected_display"),
    detectedOS: text("detected_os"),

    detectedQuantity: integer("detected_quantity"),
    detectedPrice: numeric("detected_price"),
    detectedCurrency: text("detected_currency").default("AED"),
    priceType: priceTypeEnum("price_type"),
    condition: offerConditionEnum("condition"),
    warranty: text("warranty"),
    /** The supplier's own description of the offer. */
    notes: text("notes"),
    /** Category the supplier chose in the form; used when staff add the product. */
    categoryId: uuid("category_id").references(() => categories.id),
    /** Category-specific specs beyond the six detected columns. */
    extraSpecs: jsonb("extra_specs"),

    matchedProductId: uuid("matched_product_id").references(() => products.id),
    matchConfidence: numeric("match_confidence"),
    matchMethod: matchMethodEnum("match_method"),
    matchReasons: jsonb("match_reasons"),

    reviewStatus: reviewStatusEnum("review_status"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("broadcast_items_broadcast_id_idx").on(table.broadcastId),
    index("broadcast_items_matched_product_id_idx").on(table.matchedProductId),
    index("broadcast_items_review_status_idx").on(table.reviewStatus),
    check(
      "broadcast_items_warranty_length",
      sql`char_length(${table.warranty}) <= 80`,
    ),
    check(
      "broadcast_items_notes_length",
      sql`char_length(${table.notes}) <= 1000`,
    ),
  ],
);
