import { describe, expect, it } from "vitest";
import { isForeignKeyViolation, isUniqueViolation } from "./errors";

describe("Postgres error classification", () => {
  it("recognizes a direct driver error", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
    expect(isForeignKeyViolation({ code: "23503" })).toBe(true);
  });

  it("recognizes an error wrapped by Drizzle", () => {
    const wrapped = new Error("Failed query", { cause: { code: "23505" } });
    expect(isUniqueViolation(wrapped)).toBe(true);
    expect(isForeignKeyViolation(wrapped)).toBe(false);
  });

  it("does not misclassify unrelated errors", () => {
    expect(isUniqueViolation(new Error("boom"))).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
    expect(isForeignKeyViolation("23503")).toBe(false);
  });
});
