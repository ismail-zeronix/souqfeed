export type Role = "ADMIN" | "SUPPLIER";

export function authorizeRole(
  userRole: Role | string | undefined,
  requiredRole: Role,
): boolean {
  return userRole === requiredRole;
}
