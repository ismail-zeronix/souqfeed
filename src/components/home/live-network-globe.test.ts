import { describe, expect, it } from "vitest";
import { hexToGlobeColor } from "./live-network-globe";

describe("hexToGlobeColor", () => {
  it("converts a 6-digit hex color to a 0-1 RGB tuple", () => {
    expect(hexToGlobeColor("#0F6B45")).toEqual([15 / 255, 107 / 255, 69 / 255]);
  });

  it("works without a leading #", () => {
    expect(hexToGlobeColor("FFFFFF")).toEqual([1, 1, 1]);
  });

  it("converts black to all zeros", () => {
    expect(hexToGlobeColor("#000000")).toEqual([0, 0, 0]);
  });
});
