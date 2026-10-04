# SEO Strategy

SouqFeed's SEO baseline, keyword/competitive research, and future-pages
roadmap. See `docs/branding.md`/`docs/theme.md` for voice/visual constraints
that also apply to any SEO copy — terse, factual, never consumer-ecommerce
marketing language.

**Status check first:** SouqFeed is pre-launch. The home page and `/feed`
currently run entirely on mock data (no real suppliers/offers seeded). SEO
work here is split into what's safe to ship now (technical baseline,
`llms.txt`, factually-grounded internal linking) and what must wait for real
data (indexing supplier pages, claiming specific coverage/stats).

## Technical SEO baseline (implemented)

- `public/llms.txt` — what SouqFeed is/isn't, explicit pre-launch/mock-data
  disclosure, site structure, instructions for LLM crawlers not to cite
  homepage figures or testimonials as real.
- `src/app/robots.ts` — allows `/`, disallows `/dashboard`, `/admin`,
  `/login`, `/api`.
- `src/app/sitemap.ts` — only `/` and `/feed`. `/suppliers/[slug]`
  deliberately excluded until real supplier data exists (see Known gaps).
- `src/app/layout.tsx` — `metadataBase`, OpenGraph/Twitter card metadata
  (reusing the existing hero image as a placeholder), root
  `robots: { index: true, follow: true }`.
- `src/components/seo/json-ld.tsx` — Organization + WebSite JSON-LD (with a
  `SearchAction` against `/feed?q=`). No `LocalBusiness` schema — SouqFeed
  aggregates many suppliers' real addresses, it doesn't have one of its own;
  inventing a single business address would violate the "never invent a
  specification" rule.
- `/login`, `/dashboard`, `/admin` — explicit `noindex` metadata, in addition
  to being disallowed in `robots.ts` (a disallow rule alone doesn't stop
  indexing of a URL discovered via an external link).

## Audit of current state

**Quick wins (now fixed by this pass):** no robots.txt/sitemap previously
existed; only a bare title/description existed anywhere in the app; no
OpenGraph/Twitter/`metadataBase`/JSON-LD; auth pages had no `noindex`.

**Still open:**

- No SouqFeed favicon/app icon exists yet — `public/` only has the
  unmodified `create-next-app` scaffold icons. Once a real icon asset
  exists, Next's `src/app/icon.png` convention auto-wires it into metadata.
- No `Organization.logo` in the JSON-LD — no exported logo asset exists in
  `public/` yet (only an inline "S" text badge in the header).
- Only two real public routes (`/`, `/feed`) plus one mock-backed one
  (`/suppliers/[slug]`) — nothing yet for mid-funnel category/location
  search intent beyond the home page's "Browse by category"/"Browse by
  area" links added in this same pass.
- No analytics/Search Console setup — explicitly deferred by product
  decision; nothing in this document blocks adding it later (standard
  `<head>`/script injection, independent of everything above).

## Keyword research

Grouped by intent. Verified via live web search against real Dubai
IT-wholesale geography — not assumed.

**Navigational/brand:** souqfeed, souqfeed dubai

**Category + location (highest priority — core product-market fit):**
laptop wholesale Bur Dubai, computer wholesale Dubai, IT wholesale Al
Fahidi, Al Raffa computer market, Computer Plaza Dubai wholesale, Al Ain
Centre computer shops Dubai, networking equipment wholesale Dubai, bulk
laptop suppliers Deira, refurbished laptop wholesale Dubai, server
hardware wholesale UAE

**Product/brand** (brands repeatedly confirmed as sold through this
wholesale channel): Lenovo wholesale Dubai, HP bulk laptop Dubai, Dell
laptop wholesale UAE, wholesale SSD Dubai, bulk RAM Dubai, Cisco
networking wholesale Dubai

**GCC-wide:** IT wholesale UAE, electronics wholesale GCC, bulk laptop
supplier Gulf, UAE IT distributor directory

**Differentiator terms (own these — no competitor currently does):** live
IT stock Dubai, verified IT supplier Dubai, WhatsApp stock list search

### Geography note — read before writing any more location copy

Web search confirms **Al Raffa Street** (Al Souq Al Kabeer area) and
**Al Ain Centre** ("Computer Plaza," ~60-80 shops, on Al Mankhool Road near
Al Fahidi metro station) are both **inside Bur Dubai** — they are not a
separate city or a market near the city of Al Ain. The existing mock
supplier location data already uses `"Al Fahidi"` and `"Bur Dubai"` as its
location strings, so the home page's area links alias the real,
search-friendly names to these existing values rather than introducing new,
always-empty location filters:

- "Al Fahidi — Al Raffa St."
- "Bur Dubai — Al Ain Centre / Computer Plaza"

SouqFeed's real coverage today is Dubai-only (Bur Dubai, Deira, Al Fahidi,
Al Rigga, per mock data) — **no Sharjah, Abu Dhabi, or Al Ain-city supplier
presence should be claimed** anywhere (copy, schema, or metadata) until
suppliers from those emirates are actually onboarded. Multi-emirate/GCC
expansion is a real future opportunity (see keyword list above), but it's a
roadmap item, not a current fact.

## Competitive research

- **Tradeling** (tradeling.com) — large MENA B2B wholesale marketplace,
  broad categories including electronics; static catalog/RFQ model, not
  live/WhatsApp-sourced.
- **TradersFind** (tradersfind.com) — UAE B2B directory with
  WhatsApp-contact-per-listing. Closest in _channel_ (WhatsApp-first) but a
  static directory, not live structured stock/price data.
- **Tradeloop / BrokerBin** — established global surplus/used-IT-hardware
  trading platforms. Relevant as a business-model analog (live inventory
  listings among resellers) but not UAE-focused and not WhatsApp-sourced.
- **Abraa** (abraa.com) / **Tradedubai.ae** — Dubai-specific generic
  wholesale marketplaces; broad, not IT-specialized, not real-time.
- **UAEPC** (uaepc.com) — itself a Dubai/Sharjah wholesale computer
  _dealer_, i.e. the kind of business SouqFeed indexes, not a platform
  competitor.

**Gap/opportunity:** none of the above combine (a) Dubai/UAE IT specificity,
(b) live data sourced for free from suppliers' existing WhatsApp workflow,
and (c) canonical-product search ranking that groups multiple suppliers
under one part number/model (see `docs/search.md`'s ranking order). That
combination is SouqFeed's open lane — competitive positioning and content
should lead with it rather than competing on breadth of categories.

## Future pages roadmap

**Already aligned to planned phases** (sequencing awareness, not a new scope
decision):

- Category landing pages → Phase 3 (Brands/Categories CRUD) + Phase 9
  (Search).
- Richer `/suppliers/[slug]` content → Phase 2 (CRUD) + Phase 10 (public
  profile, real data). Code already exists; becomes sitemap-worthy once the
  data behind it is real.
- Indexable `/search?q=` result pages → Phase 9, with its own
  index-bloat/pagination decision to make once that phase lands.

**Genuinely net-new — needs its own separate scope decision later, not
assumed approved by this document:**

- Standalone area/location landing pages (e.g. a dedicated Bur Dubai
  IT-wholesale hub page covering Al Fahidi/Al Raffa/Al Ain Centre).
- Brand hub pages (e.g. a Lenovo/HP/Dell wholesale landing page) beyond
  Phase 3's admin CRUD of brand records.
- Comparison/buyer-guide content (e.g. "how to verify an IT wholesaler in
  Dubai").
- A real `/about` page — footer currently lists About/Careers/Contact as
  disabled "coming soon" placeholders.

## Known gaps / honesty constraints

These are deliberate omissions, not oversights:

- `/suppliers/[slug]` is not in the sitemap because its data is mock. Add it
  back once real supplier records exist.
- No `LocalBusiness` schema, no `Organization.logo` — both need real
  data/assets this pass doesn't have.
- No multi-emirate or GCC-wide coverage claims — only what the real
  (eventually real) supplier location data supports.
- Analytics/Search Console intentionally not wired up yet — a separate,
  later decision.
