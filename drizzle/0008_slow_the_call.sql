ALTER TYPE "public"."match_method" ADD VALUE 'MANUAL';--> statement-breakpoint
CREATE INDEX "products_normalized_title_trgm_idx" ON "products" USING gin ("normalized_title" gin_trgm_ops);