# Data Model

> Decision record: `docs/superpowers/specs/2026-09-30-souqfeed-foundation-design.md`

The central relationship this schema protects (see Rule 8/9 in
`project_plan.md`): **SUPPLIER → RAW BROADCAST → BROADCAST ITEM → CANONICAL
PRODUCT → SUPPLIER OFFER → PRICE/QUANTITY/TIME**. Raw broadcasts are never
mutated. Offers never silently overwrite prior evidence — they append
observations.

All tables use UUID primary keys and `createdAt`/`updatedAt` timestamps
unless noted. This document is the source of truth for the Phase 1 Drizzle
schema; update it whenever the schema changes.

## Auth (Better Auth-managed)

- **`users`** — `id, name, email (unique), emailVerified, image, role (enum: ADMIN | SUPPLIER), createdAt, updatedAt`
- **`sessions`** — `id, userId → users.id, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt`
- **`accounts`** — `id, userId → users.id, accountId, providerId, password (hashed), createdAt, updatedAt`

Better Auth generates the exact shape of `sessions`/`accounts` via its own
migration tooling; `role` is the one custom field added to `users`.

## Suppliers

**`suppliers`**

```
id                uuid pk
userId            uuid fk -> users.id, unique   -- one login per supplier
companyName       text not null
slug              text unique not null
logo              text nullable
description       text nullable
whatsappNumber    text not null
phone             text nullable
email             text nullable
website           text nullable
locationName      text nullable                 -- e.g. "Bur Dubai"
address           text nullable
googleMapsUrl     text nullable
verified          boolean default false
active            boolean default true
createdAt         timestamp
updatedAt         timestamp
```

Indexes: unique(`slug`), index(`verified`), index(`active`).

**`supplier_brands`** — join table, `supplierId, brandId`, composite PK.
**`supplier_categories`** — join table, `supplierId, categoryId`, composite PK.

## Brands & Categories

**`brands`**: `id, name (unique), slug (unique), logoUrl (nullable), createdAt, updatedAt`

**`categories`** (self-referencing hierarchy):

```
id          uuid pk
name        text not null
slug        text unique not null
parentId    uuid fk -> categories.id, nullable
createdAt   timestamp
updatedAt   timestamp
```

Index: index(`parentId`).

## Canonical Products

**`products`**

```
id                 uuid pk
brandId            uuid fk -> brands.id, not null
categoryId         uuid fk -> categories.id, nullable
family             text nullable      -- e.g. "ThinkPad E14 Gen 7"
model              text nullable      -- e.g. "E14 Gen 7"
partNumber         text nullable      -- e.g. "21U20063GR"
title              text not null
normalizedTitle    text not null      -- lowercased/stripped, for matching
specifications     jsonb nullable
active             boolean default true
createdAt          timestamp
updatedAt          timestamp
```

Indexes: index(`brandId`), index(`categoryId`), index(`partNumber`) where not
null, GIN trigram index on `title` and `normalizedTitle` for fuzzy search.

**`product_aliases`** _(addition — see foundation spec §2)_

```
id          uuid pk
productId   uuid fk -> products.id, not null
alias       text not null   -- e.g. "U7", "Ultra 7", "Core Ultra 7"
createdAt   timestamp
```

Indexes: index(`productId`), index(`alias`).

## Broadcasts

**`broadcasts`**

```
id           uuid pk
supplierId   uuid fk -> suppliers.id, not null
rawText      text not null      -- immutable, never overwritten
status       enum(DRAFT, PROCESSING, REVIEW, PUBLISHED, FAILED)
source       enum(MANUAL, WHATSAPP, EMAIL, API) default MANUAL
publishedAt  timestamp nullable
createdAt    timestamp
updatedAt    timestamp
```

Only `MANUAL` is implemented in MVP; the other `source` values exist in the
enum so ingestion channels can be added later without a schema migration.
Indexes: index(`supplierId`), index(`createdAt`), index(`status`).

**`broadcast_items`**

```
id                  uuid pk
broadcastId         uuid fk -> broadcasts.id, not null
rawLine             text not null
rawBlock            text nullable

detectedBrand       text nullable
detectedModel       text nullable
detectedPartNumber  text nullable
detectedCPU         text nullable
detectedRAM         text nullable
detectedStorage     text nullable
detectedGPU         text nullable
detectedDisplay     text nullable
detectedOS          text nullable

detectedQuantity    integer nullable
detectedPrice       numeric nullable
detectedCurrency    text nullable default 'AED'
priceType           enum(FIXED, ASK, HIDDEN, UNKNOWN)

matchedProductId    uuid fk -> products.id, nullable
matchConfidence     numeric nullable    -- 0.0–1.0
matchMethod         enum(PART_NUMBER, SKU, BRAND_MODEL, ALIAS, BRAND_FAMILY_SPEC, FUZZY, AI, NONE)
matchReasons        jsonb nullable      -- string[]

reviewStatus        enum(AUTO_APPROVED, NEEDS_REVIEW, APPROVED, REJECTED)
createdAt           timestamp
updatedAt           timestamp
```

Indexes: index(`broadcastId`), index(`matchedProductId`), index(`reviewStatus`).

Never fabricate a detected/matched value: a field that wasn't confidently
extracted stays `null`, per Rule 10.

## Offers

**`offers`**

```
id                       uuid pk
supplierId               uuid fk -> suppliers.id, not null
productId                uuid fk -> products.id, not null
broadcastItemId          uuid fk -> broadcast_items.id, not null   -- most recent source
titleSnapshot            text
specificationSnapshot    jsonb nullable
price                    numeric nullable
currency                 text default 'AED'
priceType                enum(FIXED, ASK, HIDDEN, UNKNOWN)
quantity                 integer nullable
availabilityStatus       enum(AVAILABLE, LIMITED, ASK, UNKNOWN, SOLD_OUT)
lastVerifiedAt           timestamp
publishedAt              timestamp
expiresAt                timestamp nullable
active                   boolean default true
createdAt                timestamp
updatedAt                timestamp
```

Indexes: index(`supplierId`), index(`productId`), index(`publishedAt`),
index(`active`). Unique partial index on (`supplierId`, `productId`) where
`active = true` — a supplier re-broadcasting a product updates its existing
offer rather than creating a duplicate.

**`offer_observations`** _(addition — see foundation spec §2)_

```
id                   uuid pk
offerId              uuid fk -> offers.id, not null
price                numeric nullable
currency             text
quantity             integer nullable
availabilityStatus   enum(AVAILABLE, LIMITED, ASK, UNKNOWN, SOLD_OUT)
observedAt           timestamp default now
broadcastItemId      uuid fk -> broadcast_items.id, not null
```

Indexes: index(`offerId`), index(`observedAt`). Append-only — one row per
re-broadcast of an existing offer. This is the price/quantity history table;
`offers` itself only holds the current snapshot.

### Freshness (derived, not stored)

Computed at query/render time from `lastVerifiedAt` — thresholds are
configuration, not schema:

| Age        | Label      |
| ---------- | ---------- |
| < 6 hours  | LIVE       |
| < 24 hours | RECENT     |
| 1–3 days   | STALE      |
| > 3 days   | VERY_STALE |

## Analytics

**`analytics_events`**

```
id           uuid pk
eventType    text                  -- e.g. "offer.viewed", "supplier.whatsapp_clicked"
supplierId   uuid fk -> suppliers.id, nullable
productId    uuid fk -> products.id, nullable
offerId      uuid fk -> offers.id, nullable
query        text nullable
metadata     jsonb nullable
createdAt    timestamp
```

Indexes: index(`eventType`), index(`createdAt`), index(`supplierId`).
