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
