CREATE TYPE "public"."broadcast_source" AS ENUM('MANUAL', 'WHATSAPP', 'EMAIL', 'API');--> statement-breakpoint
CREATE TYPE "public"."broadcast_status" AS ENUM('DRAFT', 'PROCESSING', 'REVIEW', 'PUBLISHED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."match_method" AS ENUM('PART_NUMBER', 'SKU', 'BRAND_MODEL', 'ALIAS', 'BRAND_FAMILY_SPEC', 'FUZZY', 'AI', 'NONE');--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('FIXED', 'ASK', 'HIDDEN', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('AUTO_APPROVED', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."availability_status" AS ENUM('AVAILABLE', 'LIMITED', 'ASK', 'UNKNOWN', 'SOLD_OUT');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"supplier_id" uuid,
	"product_id" uuid,
	"offer_id" uuid,
	"query" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_name_unique" UNIQUE("name"),
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "broadcast_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"broadcast_id" uuid NOT NULL,
	"raw_line" text NOT NULL,
	"raw_block" text,
	"detected_brand" text,
	"detected_model" text,
	"detected_part_number" text,
	"detected_cpu" text,
	"detected_ram" text,
	"detected_storage" text,
	"detected_gpu" text,
	"detected_display" text,
	"detected_os" text,
	"detected_quantity" integer,
	"detected_price" numeric,
	"detected_currency" text DEFAULT 'AED',
	"price_type" "price_type",
	"matched_product_id" uuid,
	"match_confidence" numeric,
	"match_method" "match_method",
	"match_reasons" jsonb,
	"review_status" "review_status",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broadcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"raw_text" text NOT NULL,
	"status" "broadcast_status" DEFAULT 'DRAFT' NOT NULL,
	"source" "broadcast_source" DEFAULT 'MANUAL' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "offer_observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" uuid NOT NULL,
	"price" numeric,
	"currency" text,
	"quantity" integer,
	"availability_status" "availability_status",
	"observed_at" timestamp DEFAULT now() NOT NULL,
	"broadcast_item_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"broadcast_item_id" uuid NOT NULL,
	"title_snapshot" text,
	"specification_snapshot" jsonb,
	"price" numeric,
	"currency" text DEFAULT 'AED',
	"price_type" "price_type",
	"quantity" integer,
	"availability_status" "availability_status",
	"last_verified_at" timestamp,
	"published_at" timestamp,
	"expires_at" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"alias" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"category_id" uuid,
	"family" text,
	"model" text,
	"part_number" text,
	"title" text NOT NULL,
	"normalized_title" text NOT NULL,
	"specifications" jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_brands" (
	"supplier_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	CONSTRAINT "supplier_brands_supplier_id_brand_id_pk" PRIMARY KEY("supplier_id","brand_id")
);
--> statement-breakpoint
CREATE TABLE "supplier_categories" (
	"supplier_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "supplier_categories_supplier_id_category_id_pk" PRIMARY KEY("supplier_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company_name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"description" text,
	"whatsapp_number" text NOT NULL,
	"phone" text,
	"email" text,
	"website" text,
	"location_name" text,
	"address" text,
	"google_maps_url" text,
	"verified" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "suppliers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcast_items" ADD CONSTRAINT "broadcast_items_broadcast_id_broadcasts_id_fk" FOREIGN KEY ("broadcast_id") REFERENCES "public"."broadcasts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcast_items" ADD CONSTRAINT "broadcast_items_matched_product_id_products_id_fk" FOREIGN KEY ("matched_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_observations" ADD CONSTRAINT "offer_observations_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_observations" ADD CONSTRAINT "offer_observations_broadcast_item_id_broadcast_items_id_fk" FOREIGN KEY ("broadcast_item_id") REFERENCES "public"."broadcast_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_broadcast_item_id_broadcast_items_id_fk" FOREIGN KEY ("broadcast_item_id") REFERENCES "public"."broadcast_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_aliases" ADD CONSTRAINT "product_aliases_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_brands" ADD CONSTRAINT "supplier_brands_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_brands" ADD CONSTRAINT "supplier_brands_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_categories" ADD CONSTRAINT "supplier_categories_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_categories" ADD CONSTRAINT "supplier_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_event_type_idx" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_supplier_id_idx" ON "analytics_events" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "broadcast_items_broadcast_id_idx" ON "broadcast_items" USING btree ("broadcast_id");--> statement-breakpoint
CREATE INDEX "broadcast_items_matched_product_id_idx" ON "broadcast_items" USING btree ("matched_product_id");--> statement-breakpoint
CREATE INDEX "broadcast_items_review_status_idx" ON "broadcast_items" USING btree ("review_status");--> statement-breakpoint
CREATE INDEX "broadcasts_supplier_id_idx" ON "broadcasts" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "broadcasts_created_at_idx" ON "broadcasts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "broadcasts_status_idx" ON "broadcasts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "offer_observations_offer_id_idx" ON "offer_observations" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "offer_observations_observed_at_idx" ON "offer_observations" USING btree ("observed_at");--> statement-breakpoint
CREATE INDEX "offers_supplier_id_idx" ON "offers" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "offers_product_id_idx" ON "offers" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "offers_published_at_idx" ON "offers" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "offers_active_idx" ON "offers" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "offers_supplier_product_active_unique_idx" ON "offers" USING btree ("supplier_id","product_id") WHERE "offers"."active" = true;--> statement-breakpoint
CREATE INDEX "product_aliases_product_id_idx" ON "product_aliases" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_aliases_alias_idx" ON "product_aliases" USING btree ("alias");--> statement-breakpoint
CREATE INDEX "products_brand_id_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_part_number_idx" ON "products" USING btree ("part_number");