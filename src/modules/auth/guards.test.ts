import { describe, expect, it } from "vitest";
import { authorizeRole } from "./guards";

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
});
