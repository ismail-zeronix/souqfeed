export type Role = "ADMIN" | "SUPPLIER" | "BUYER";

export function authorizeRole(
  userRole: Role | string | undefined,
  requiredRole: Role,
): boolean {
  return userRole === requiredRole;
}

export function canAccessUserDashboard(userRole: Role | string | undefined) {
  return userRole === "BUYER" || userRole === "SUPPLIER";
}

/**
 * The only roles a public signup may choose. ADMIN is never self-assignable:
 * it is granted out-of-band by `src/lib/database/seed.ts`. Returns null for
 * anything else so the caller rejects the request instead of guessing.
 */
export function resolveSignupRole(
  requestedRole: unknown,
): "BUYER" | "SUPPLIER" | null {
  if (requestedRole === undefined) return "SUPPLIER";
  if (requestedRole === "BUYER" || requestedRole === "SUPPLIER") {
    return requestedRole;
  }
  return null;
}
