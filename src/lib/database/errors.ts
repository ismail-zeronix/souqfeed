const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

/** Drizzle wraps driver errors, so the Postgres code may be on `.cause`. */
function getPostgresErrorCode(error: unknown): string | undefined {
  let current = error;
  for (let depth = 0; depth < 5 && current; depth += 1) {
    if (typeof current !== "object") return undefined;
    const { code, cause } = current as { code?: unknown; cause?: unknown };
    if (typeof code === "string") return code;
    current = cause;
  }
  return undefined;
}

export function isUniqueViolation(error: unknown): boolean {
  return getPostgresErrorCode(error) === UNIQUE_VIOLATION;
}

export function isForeignKeyViolation(error: unknown): boolean {
  return getPostgresErrorCode(error) === FOREIGN_KEY_VIOLATION;
}
