import { describe, expect, it } from "vitest";
import {
  authorizeRole,
  canAccessUserDashboard,
  canSignInThroughPortal,
  isStaffRole,
  portalFromHeader,
  resolveSignupRole,
} from "./guards";

describe("resolveSignupRole", () => {
  it("allows the two public account types", () => {
    expect(resolveSignupRole("BUYER")).toBe("BUYER");
    expect(resolveSignupRole("SUPPLIER")).toBe("SUPPLIER");
  });

  it("uses the default account type when none is requested", () => {
    expect(resolveSignupRole(undefined)).toBe("SUPPLIER");
  });

  it("never allows ADMIN or any other value", () => {
    for (const role of [
      "ADMIN",
      "SUPER_ADMIN",
      "admin",
      "",
      null,
      1,
      ["ADMIN"],
      {},
    ]) {
      expect(resolveSignupRole(role)).toBeNull();
    }
  });
});

describe("authorizeRole", () => {
  it("allows a matching role", () => {
    expect(authorizeRole("ADMIN", "ADMIN")).toBe(true);
  });

  it("denies a mismatched role", () => {
    expect(authorizeRole("SUPPLIER", "ADMIN")).toBe(false);
  });

  it("denies an undefined role", () => {
    expect(authorizeRole(undefined, "ADMIN")).toBe(false);
  });

  it("allows buyer and supplier accounts into the user dashboard", () => {
    expect(canAccessUserDashboard("BUYER")).toBe(true);
    expect(canAccessUserDashboard("SUPPLIER")).toBe(true);
    expect(canAccessUserDashboard("ADMIN")).toBe(false);
    expect(canAccessUserDashboard("SUPER_ADMIN")).toBe(false);
  });
});

describe("isStaffRole", () => {
  it("treats admins and super admins as staff", () => {
    expect(isStaffRole("ADMIN")).toBe(true);
    expect(isStaffRole("SUPER_ADMIN")).toBe(true);
  });

  it("does not treat buyers, suppliers, or unknown roles as staff", () => {
    for (const role of ["BUYER", "SUPPLIER", "admin", "", undefined]) {
      expect(isStaffRole(role)).toBe(false);
    }
  });
});

describe("portal sign-in", () => {
  it("reads only an exact admin header as the admin portal", () => {
    expect(portalFromHeader("admin")).toBe("admin");
    for (const value of [null, undefined, "", "ADMIN", "public"]) {
      expect(portalFromHeader(value)).toBe("public");
    }
  });

  it("lets staff sign in only through the admin portal", () => {
    for (const role of ["ADMIN", "SUPER_ADMIN"]) {
      expect(canSignInThroughPortal(role, "admin")).toBe(true);
      expect(canSignInThroughPortal(role, "public")).toBe(false);
    }
  });

  it("lets buyers and suppliers sign in only through the public portal", () => {
    for (const role of ["BUYER", "SUPPLIER"]) {
      expect(canSignInThroughPortal(role, "public")).toBe(true);
      expect(canSignInThroughPortal(role, "admin")).toBe(false);
    }
  });
});
