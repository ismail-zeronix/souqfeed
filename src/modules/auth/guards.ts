export type Role = "SUPER_ADMIN" | "ADMIN" | "SUPPLIER" | "BUYER";

export function authorizeRole(
  userRole: Role | string | undefined,
  requiredRole: Role,
): boolean {
  return userRole === requiredRole;
}

/** Staff run the admin panel. Only super admins will manage other admins. */
export function isStaffRole(userRole: Role | string | undefined): boolean {
  return userRole === "ADMIN" || userRole === "SUPER_ADMIN";
}

export function canAccessUserDashboard(userRole: Role | string | undefined) {
  return userRole === "BUYER" || userRole === "SUPPLIER";
}

/**
 * Admins sign in at /admin/login, everyone else at /login. The admin login
 * form sends this header; the public form doesn't. Forging it only lets
 * someone who already has the password use the other page; the role checks
 * on every admin page and action are the real boundary.
 */
export const PORTAL_HEADER = "x-souqfeed-portal";

export type Portal = "admin" | "public";

export function portalFromHeader(value: string | null | undefined): Portal {
  return value === "admin" ? "admin" : "public";
}

export function canSignInThroughPortal(
  userRole: Role | string | undefined,
  portal: Portal,
): boolean {
  return portal === "admin" ? isStaffRole(userRole) : !isStaffRole(userRole);
}

/**
 * The only roles a public signup may choose. Staff roles are never
 * self-assignable: they are granted out-of-band by `src/lib/database/seed.ts`.
 * Returns null for anything else so the caller rejects the request instead of
 * guessing.
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
