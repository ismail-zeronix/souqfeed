-- Rule 8: raw broadcast text is immutable. Enforced here so no code path,
-- script, or manual query can rewrite the evidence an offer traces back to.
CREATE OR REPLACE FUNCTION "public"."reject_raw_text_change"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '%.% is immutable', TG_TABLE_NAME, TG_ARGV[0]
    USING ERRCODE = 'restrict_violation';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "broadcasts_raw_text_immutable"
  BEFORE UPDATE OF "raw_text" ON "public"."broadcasts"
  FOR EACH ROW
  WHEN (OLD."raw_text" IS DISTINCT FROM NEW."raw_text")
  EXECUTE FUNCTION "public"."reject_raw_text_change"('raw_text');
--> statement-breakpoint
CREATE TRIGGER "broadcast_items_raw_line_immutable"
  BEFORE UPDATE OF "raw_line", "raw_block" ON "public"."broadcast_items"
  FOR EACH ROW
  WHEN (
    OLD."raw_line" IS DISTINCT FROM NEW."raw_line"
    OR OLD."raw_block" IS DISTINCT FROM NEW."raw_block"
  )
  EXECUTE FUNCTION "public"."reject_raw_text_change"('raw_line');
