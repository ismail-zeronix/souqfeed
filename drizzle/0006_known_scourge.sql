ALTER TABLE "broadcast_items" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD COLUMN "status_note" text;