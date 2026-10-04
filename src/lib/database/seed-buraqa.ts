import postgres from "postgres";

export const BURAQA_SUPPLIER = {
  slug: "buraqa-star-computer",
  companyName: "Buraqa Star Computer Trading LLC",
  website: "https://buraqauae.com/",
  phone: "+97143403839",
  email: "buraqa.info@gmail.com",
  locationName: "Bur Dubai",
  address: "Al Suq Al Kabeer Building, Raffa Road, Bur Dubai, Dubai, UAE",
} as const;

export const BURAQA_PRODUCTS = [
  ["E9044F5FEB48", "HP 15 / HP 250 SERIES", "HP 15-FD0027ST — I3-N305, 8GB, 256SSD, 15.6\", W11"], ["0918774C059B", "HP 15 / HP 250 SERIES", "HP 15-FD0123DX — I3-1315U, 8GB, 256SSD, 15.6\" TOUCH, W11"], ["1ED27AA2C2E6", "HP 15 / HP 250 SERIES", "HP 15-FD0131WM — I3-N305, 8GB, 256SSD, 15.6\", W11"], ["92612FE99814", "HP 15 / HP 250 SERIES", "HP 15-FD0133WM — I3-N305, 8GB, 256SSD, 15.6\", W11"], ["1458E1FCFB07", "HP 15 / HP 250 SERIES", "HP 15-FD0139WM — I3-N305, 8GB, 256SSD, 15.6\" TOUCH, W11"], ["734A76706138", "HP 15 / HP 250 SERIES", "HP 15-FD0230WM — I3-N305, 8GB, 256SSD, TOUCH, W11"], ["34188CC71357", "HP 15 / HP 250 SERIES", "HP 15-FD0362NIA — I5-1334U, 8GB, 512SSD, 2GB, 15.6\" FHD, DOS"], ["24601AFB12B3", "HP 15 / HP 250 SERIES", "HP 15-FD0912TU — CORE5-120U, 8GB, 512SSD, 15.6\", DOS"], ["8F993F6483FE", "HP 15 / HP 250 SERIES", "HP 15-FD1311TU — ULTRA 5-125H, 8GB, 512SSD, 15.6\", DOS, ENG, SILVER"], ["35720F7228F9", "HP 15 / HP 250 SERIES", "HP 250R G9 — CORE5-120U, 8GB, 512SSD, 15.6\", DOS"], ["F7DBD213906E", "HP 15 / HP 250 SERIES", "HP 250RG10 — CORE3-100U, 8GB, 512SSD, 15.6\" FHD, DOS, BACKLITE"], ["9DDBEA22766B", "HP 15 / HP 250 SERIES", "HP 250RG10 — CORE5-120U, 16GB, 512SSD, 15.6\" FHD, DOS, SIL"], ["F96BD6EEA52A", "HP 15 / HP 250 SERIES", "HP 250RG10 — CORE5-120U, 8GB, 512SSD, 15.6\" FHD, DOS, E/A"], ["D0987EAED8F5", "HP 15 / HP 250 SERIES", "HP 15-FD0238NIA — I7-1355U, 8GB, 512SSD, 15.6\" FHD, DOS, SILVER"], ["E9743BC9D8CC", "HP 15 / HP 250 SERIES", "HP 15-FD0558NIA — I7-1355U, 8GB, 512SSD, 15.6\" FHD, DOS, SILVER"], ["798160C52219", "HP 15 / HP 250 SERIES", "HP 15-FD1310TU — ULTRA7-155H, 8GB, 512SSD, 15.6\", DOS, SILVER"], ["6EAC351FCC69", "HP PROBOOK SERIES", "HP PROBOOK 440-G11 — CORE ULTRA-5 125U, 16GB, 512SSD, 14\" FHD, DOS"], ["3AB8D89009FA", "HP PROBOOK SERIES", "HP PROBOOK 450-G9 — I5-1235U, 8GB, 512SSD, 15.6\" FHD, DOS, SILVER"], ["66FCD7F87086", "HP PROBOOK SERIES", "HP PROBOOK 460-G11 — ULTRA 5-125U, 16GB, 512SSD, 16\", DOS"], ["A0BF4A7FB436", "HP PROBOOK SERIES", "HP PROBOOK 4 G1i 16 — ULTRA 5-225U, 16GB, 512SSD, 16\", DOS, BACKLITE"], ["21F659B77CCB", "HP PROBOOK SERIES", "HP PROBOOK 440-G11 — CORE ULTRA-7 155U, 16GB, 512SSD, 14\", DOS, SILVER"], ["D978E93C62EC", "HP PROBOOK SERIES", "HP PROBOOK 460-G11 — ULTRA 7-155U, 16GB, 512SSD, 16\", DOS"], ["97D77650711D", "HP PROBOOK SERIES", "HP PROBOOK 460-G11 — ULTRA 7-155U, 16GB, 512SSD, 16\", DOS, SILVER"], ["53CE4914ACD0", "HP PROBOOK SERIES", "HP PROBOOK 4 G1i 16 — ULTRA 7-255H, 16GB, 1TBSSD, RTX3050 4GB, 16\", DOS"], ["4EFC0D468C27", "HP PROBOOK SERIES", "HP PROBOOK 4 G1i 16 — ULTRA 7-255H, 16GB, 512SSD, RTX3050 4GB, 16\", DOS"], ["E63D344D48D0", "HP PROBOOK SERIES", "HP PROBOOK 4 G1i 16 — ULTRA 7-255U, 16GB, 512SSD, 16\", DOS"], ["20DF7759D2F4", "HP OMNIBOOK SERIES", "HP OMNIBOOK XFLIP 14-FM0013DX — CORE ULTRA5-226V, 16GB, 512 SSD, 14\" 2K, WIN 11, SILVER"],
].map(([recordId, category, specification]) => ({ recordId, category, specification, brand: "HP", sourceDate: "2026-09-30", sourceReference: "Supplier stock index in ZERONIX-PROCUREMENT-AGENT.md" }));

const rawMarker = "BURAQA_STAR_COMPUTER_SEED_V1";
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export async function seedBuraqa(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  const sql = postgres(databaseUrl);
  try {
    await sql.begin(async (tx) => {
      await tx`insert into "user" (id, name, email, email_verified, role) values ('buraqa-star-computer-user', ${BURAQA_SUPPLIER.companyName}, 'buraqa.star.computer@souqfeed.local', false, 'SUPPLIER') on conflict (id) do update set name=excluded.name, role='SUPPLIER'`;
      const supplier = await tx`insert into suppliers (user_id, company_name, slug, description, whatsapp_number, phone, email, website, location_name, address, verified, active) values ('buraqa-star-computer-user', ${BURAQA_SUPPLIER.companyName}, ${BURAQA_SUPPLIER.slug}, 'Dubai-based IT wholesaler and computer trading company.', '+971502283136', ${BURAQA_SUPPLIER.phone}, ${BURAQA_SUPPLIER.email}, ${BURAQA_SUPPLIER.website}, ${BURAQA_SUPPLIER.locationName}, ${BURAQA_SUPPLIER.address}, false, true) on conflict (slug) do update set company_name=excluded.company_name, phone=excluded.phone, email=excluded.email, website=excluded.website, location_name=excluded.location_name, address=excluded.address, updated_at=now() returning id`;
      const supplierId = supplier[0].id;
      const brand = await tx`insert into brands (name, slug) values ('HP', 'hp') on conflict (slug) do update set name='HP' returning id`;
      const category = await tx`insert into categories (name, slug) values ('Laptops', 'laptops') on conflict (slug) do update set name='Laptops' returning id`;
      const brandId = brand[0].id;
      const categoryId = category[0].id;
      await tx`insert into supplier_brands (supplier_id, brand_id) values (${supplierId}, ${brandId}) on conflict do nothing`;
      await tx`insert into supplier_categories (supplier_id, category_id) values (${supplierId}, ${categoryId}) on conflict do nothing`;
      const rawText = `${rawMarker}\n${JSON.stringify(BURAQA_PRODUCTS)}`;
      const broadcast = await tx`insert into broadcasts (supplier_id, raw_text, status, source, published_at) select ${supplierId}, ${rawText}, 'PUBLISHED', 'MANUAL', now() where not exists (select 1 from broadcasts where supplier_id=${supplierId} and raw_text like ${rawMarker + "%"}) returning id`;
      const broadcastId = broadcast[0]?.id ?? (await tx`select id from broadcasts where supplier_id=${supplierId} and raw_text like ${rawMarker + "%"} order by created_at desc limit 1`)[0].id;
      for (const product of BURAQA_PRODUCTS) {
        const partNumber = product.specification.match(/[A-Z0-9]+-[A-Z0-9-]+/)?.[0] ?? null;
        const existing = await tx`select id from products where title=${product.specification} limit 1`;
        const productRow = existing[0] ?? (await tx`insert into products (brand_id, category_id, family, model, part_number, title, normalized_title, specifications) values (${brandId}, ${categoryId}, ${product.category}, ${product.specification.split(" — ")[0]}, ${partNumber}, ${product.specification}, ${normalize(product.specification)}, ${JSON.stringify(product)}::jsonb) returning id`)[0];
        const item = await tx`insert into broadcast_items (broadcast_id, raw_line, raw_block, detected_brand, detected_model, detected_currency, price_type, matched_product_id, match_confidence, match_method, match_reasons, review_status) select ${broadcastId}, ${product.specification}, ${JSON.stringify(product)}, 'HP', ${product.specification.split(" — ")[0]}, 'AED', 'UNKNOWN', ${productRow.id}, 1.0, 'BRAND_MODEL', '["Imported from supplier stock index; no price or quantity supplied"]'::jsonb, 'AUTO_APPROVED' where not exists (select 1 from broadcast_items where broadcast_id=${broadcastId} and raw_line=${product.specification}) returning id`;
        const itemId = item[0]?.id ?? (await tx`select id from broadcast_items where broadcast_id=${broadcastId} and raw_line=${product.specification} limit 1`)[0].id;
        await tx`insert into offers (supplier_id, product_id, broadcast_item_id, title_snapshot, specification_snapshot, price, currency, price_type, quantity, availability_status, last_verified_at, published_at, active) select ${supplierId}, ${productRow.id}, ${itemId}, ${product.specification}, ${JSON.stringify(product)}::jsonb, null, 'AED', 'UNKNOWN', null, 'UNKNOWN', now(), now(), true where not exists (select 1 from offers where supplier_id=${supplierId} and product_id=${productRow.id} and active=true)`;
      }
    });
    console.log(`Seeded Buraqa catalog: ${BURAQA_PRODUCTS.length} source rows.`);
  } finally { await sql.end(); }
}

if (process.argv[1]?.endsWith("seed-buraqa.ts")) seedBuraqa().catch((error) => { console.error(error); process.exit(1); });
