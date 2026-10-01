// Re-exports every module's schema so drizzle() gets one combined object
// for its relational query API. Tasks 2 and 3 append to this as they add
// each module's tables.
export * from "@/modules/auth/schema";
export * from "@/modules/brands/schema";
export * from "@/modules/categories/schema";
export * from "@/modules/suppliers/schema";
export * from "@/modules/products/schema";
export * from "@/modules/broadcasts/schema";
export * from "@/modules/offers/schema";
export * from "@/modules/analytics/schema";
