// Re-exports every module's schema so drizzle() gets one combined object
// for its relational query API. Tasks 2 and 3 append to this as they add
// each module's tables.
export * from "@/modules/auth/schema";
