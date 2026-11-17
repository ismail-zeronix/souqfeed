import { describe, expect, it } from "vitest";
import { adminBreadcrumbs, isNavItemActive } from "./admin-nav-config";

describe("isNavItemActive", () => {
  it("matches the dashboard only on the exact path", () => {
    expect(isNavItemActive("/admin", "/admin")).toBe(true);
    expect(isNavItemActive("/admin", "/admin/products")).toBe(false);
  });

  it("matches a section and its child pages", () => {
    expect(isNavItemActive("/admin/products", "/admin/products")).toBe(true);
    expect(isNavItemActive("/admin/products", "/admin/products/new")).toBe(
      true,
    );
  });

  it("does not match a section that only shares a prefix", () => {
    expect(isNavItemActive("/admin/brands", "/admin/brandsx")).toBe(false);
  });
});

describe("adminBreadcrumbs", () => {
  it("names top-level pages", () => {
    expect(adminBreadcrumbs("/admin")).toEqual([{ title: "Dashboard" }]);
    expect(adminBreadcrumbs("/admin/suppliers")).toEqual([
      { title: "Suppliers" },
    ]);
  });

  it("links back to the section from a child page", () => {
    expect(adminBreadcrumbs("/admin/products/new")).toEqual([
      { title: "Products", href: "/admin/products" },
      { title: "New" },
    ]);
    expect(adminBreadcrumbs("/admin/products/0b1c")).toEqual([
      { title: "Products", href: "/admin/products" },
      { title: "Edit" },
    ]);
  });
});
