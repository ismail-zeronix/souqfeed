-- The Buraqa seeder double-encoded its JSON, storing strings instead of objects.
-- Unwrap them so edits keep this data and the cleanup below can recognize the rows.
-- The match is narrow because only that seeder's output is safe to cast this way.
UPDATE "products" SET "specifications" = ("specifications" #>> '{}')::jsonb
WHERE jsonb_typeof("specifications") = 'string'
  AND "specifications"::text LIKE '%ZERONIX-PROCUREMENT-AGENT.md%';--> statement-breakpoint
UPDATE "offers" SET "specification_snapshot" = ("specification_snapshot" #>> '{}')::jsonb
WHERE jsonb_typeof("specification_snapshot") = 'string'
  AND "specification_snapshot"::text LIKE '%ZERONIX-PROCUREMENT-AGENT.md%';--> statement-breakpoint
-- The same seeder guessed part numbers with a regex, storing CPU names such as
-- CORE5-120U. Clear those guesses (Rule 10) and any remaining duplicates, which
-- would block the unique index below. Only part_number changes; no row is removed.
UPDATE "products" SET "part_number" = NULL
WHERE "part_number" IS NOT NULL
  AND (
    "specifications"->>'sourceReference' = 'Supplier stock index in ZERONIX-PROCUREMENT-AGENT.md'
    OR ("brand_id", "part_number") IN (
      SELECT "brand_id", "part_number" FROM "products"
      WHERE "part_number" IS NOT NULL
      GROUP BY "brand_id", "part_number"
      HAVING count(*) > 1
    )
  );--> statement-breakpoint
CREATE UNIQUE INDEX "brands_name_lower_unique" ON "brands" USING btree (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "categories_parent_name_lower_unique" ON "categories" USING btree (coalesce("parent_id", '00000000-0000-0000-0000-000000000000'::uuid),lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "product_aliases_product_alias_lower_unique" ON "product_aliases" USING btree ("product_id",lower("alias"));--> statement-breakpoint
CREATE UNIQUE INDEX "products_brand_part_number_unique" ON "products" USING btree ("brand_id","part_number");