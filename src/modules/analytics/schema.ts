import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { suppliers } from "@/modules/suppliers/schema";
import { products } from "@/modules/products/schema";
import { offers } from "@/modules/offers/schema";

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type").notNull(),
    supplierId: uuid("supplier_id").references(() => suppliers.id),
    productId: uuid("product_id").references(() => products.id),
    offerId: uuid("offer_id").references(() => offers.id),
    query: text("query"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("analytics_events_event_type_idx").on(table.eventType),
    index("analytics_events_created_at_idx").on(table.createdAt),
    index("analytics_events_supplier_id_idx").on(table.supplierId),
  ],
);
