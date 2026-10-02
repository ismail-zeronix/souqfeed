import { describe, expect, it } from "vitest";
import { easeOutCubic } from "./stat-tile";

describe("easeOutCubic", () => {
  it("starts at 0 for progress 0", () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it("ends at 1 for progress 1", () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it("is past the halfway point at progress 0.5 (ease-out decelerates)", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it("never overshoots past 1", () => {
    expect(easeOutCubic(1)).toBeLessThanOrEqual(1);
  });
});
