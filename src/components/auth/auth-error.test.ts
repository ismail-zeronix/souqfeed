import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "./auth-error";

describe("getAuthErrorMessage", () => {
  it("explains the buyer role migration error", () => {
    expect(getAuthErrorMessage({ code: "FAILED_TO_CREATE_USER" })).toContain(
      "account could not be created",
    );
  });

  it("falls back to a supplied server message", () => {
    expect(getAuthErrorMessage({ message: "Email already exists" })).toBe(
      "Email already exists",
    );
  });
});
