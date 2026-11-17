import {
  FolderTree,
  LayoutDashboard,
  Package,
  Store,
  Tags,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { title: string; href: string; icon: LucideIcon };

export const ADMIN_NAV: { label: string; items: AdminNavItem[] }[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Marketplace",
    items: [{ title: "Suppliers", href: "/admin/suppliers", icon: Store }],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "Brands", href: "/admin/brands", icon: Tags },
      { title: "Categories", href: "/admin/categories", icon: FolderTree },
    ],
  },
];

export function isNavItemActive(href: string, pathname: string): boolean {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}

const SECTION_TITLES: Record<string, string> = Object.fromEntries(
  ADMIN_NAV.flatMap((group) => group.items).map((item) => [
    item.href,
    item.title,
  ]),
);

/** Breadcrumb trail for an admin path, e.g. Products › New product. */
export function adminBreadcrumbs(
  pathname: string,
): { title: string; href?: string }[] {
  const [, , section, child] = pathname.split("/");
  if (!section) return [{ title: "Dashboard" }];

  const sectionHref = `/admin/${section}`;
  const sectionTitle = SECTION_TITLES[sectionHref] ?? section;
  if (!child) return [{ title: sectionTitle }];

  return [
    { title: sectionTitle, href: sectionHref },
    { title: child === "new" ? "New" : "Edit" },
  ];
}
