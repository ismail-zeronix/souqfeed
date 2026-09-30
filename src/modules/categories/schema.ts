import {
  pgTable,
  uuid,
  text,
  timestamp,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: uuid("parent_id").references((): AnyPgColumn => categories.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
