import { describe, expect, it } from "vitest";
import {
  authorizeRole,
  canAccessUserDashboard,
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
    for (const role of ["ADMIN", "admin", "", null, 1, ["ADMIN"], {}]) {
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
  });
});
