/**
 * Pages that hide the public header, footer, and mobile nav: the login page,
 * and the whole admin area, which has its own top bar.
 */
export function hidesSiteChrome(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}
