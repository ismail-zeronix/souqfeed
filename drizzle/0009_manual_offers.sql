CREATE TYPE "public"."offer_condition" AS ENUM('NEW', 'OPEN_BOX', 'REFURBISHED', 'USED');--> statement-breakpoint
ALTER TYPE "public"."broadcast_source" ADD VALUE 'FORM';--> statement-breakpoint
DROP INDEX "offers_supplier_product_active_unique_idx";--> statement-breakpoint
ALTER TABLE "broadcast_items" ADD COLUMN "condition" "offer_condition";--> statement-breakpoint
ALTER TABLE "broadcast_items" ADD COLUMN "warranty" text;--> statement-breakpoint
ALTER TABLE "broadcast_items" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "broadcast_items" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "broadcast_items" ADD COLUMN "extra_specs" jsonb;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "condition" "offer_condition";--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "warranty" text;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "broadcast_items" ADD CONSTRAINT "broadcast_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- NULLS NOT DISTINCT added by hand (Drizzle cannot express it on an index):
-- an offer with no stated condition is still unique per supplier + product.
CREATE UNIQUE INDEX "offers_supplier_product_condition_active_unique_idx" ON "offers" USING btree ("supplier_id","product_id","condition") NULLS NOT DISTINCT WHERE "offers"."active" = true;--> statement-breakpoint
ALTER TABLE "broadcast_items" ADD CONSTRAINT "broadcast_items_warranty_length" CHECK (char_length("broadcast_items"."warranty") <= 80);--> statement-breakpoint
ALTER TABLE "broadcast_items" ADD CONSTRAINT "broadcast_items_notes_length" CHECK (char_length("broadcast_items"."notes") <= 1000);--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_warranty_length" CHECK (char_length("offers"."warranty") <= 80);--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_notes_length" CHECK (char_length("offers"."notes") <= 1000);