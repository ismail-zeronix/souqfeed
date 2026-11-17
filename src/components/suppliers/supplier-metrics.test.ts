import { describe, expect, it } from "vitest";
import { formatPositiveScore, formatTenure } from "./supplier-metrics";

describe("formatPositiveScore", () => {
  it("shows a real score", () => {
    expect(formatPositiveScore(98)).toBe("98%");
  });

  it("shows a dash instead of 0% when there is no data", () => {
    expect(formatPositiveScore(0)).toBe("—");
  });
});

describe("formatTenure", () => {
  it("shows whole years on the platform", () => {
    expect(formatTenure(2016, 2026)).toBe("10+ years");
  });

  it("labels a supplier who joined this year as new", () => {
    expect(formatTenure(2026, 2026)).toBe("New");
  });
});
