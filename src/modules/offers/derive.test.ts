import { describe, expect, it } from "vitest";
import { availabilityFor, specificationSnapshot } from "./derive";
import { freshnessOf } from "./freshness";

describe("availabilityFor", () => {
  it("is available when a quantity is stated", () => {
    expect(availabilityFor({ quantity: 20, priceType: "FIXED" })).toBe(
      "AVAILABLE",
    );
    expect(availabilityFor({ quantity: 3, priceType: "ASK" })).toBe(
      "AVAILABLE",
    );
  });

  it("is ask when only ask-for-price is given", () => {
    expect(availabilityFor({ quantity: null, priceType: "ASK" })).toBe("ASK");
  });

  it("is unknown otherwise, never guessed", () => {
    expect(availabilityFor({ quantity: null, priceType: "FIXED" })).toBe(
      "UNKNOWN",
    );
    expect(availabilityFor({ quantity: null, priceType: null })).toBe(
      "UNKNOWN",
    );
    expect(availabilityFor({ quantity: 0, priceType: "FIXED" })).toBe(
      "UNKNOWN",
    );
  });
});

describe("specificationSnapshot", () => {
  it("prefers what the supplier stated and fills gaps from the product", () => {
    expect(
      specificationSnapshot(
        { cpu: "Intel Core i5-1235U", ram: "8GB", storage: null },
        { ram: "16GB", storage: "512GB SSD", os: "Windows 11", extra: "x" },
      ),
    ).toEqual({
      cpu: "Intel Core i5-1235U",
      ram: "8GB",
      storage: "512GB SSD",
      os: "Windows 11",
    });
  });

  it("is null when nothing is known", () => {
    expect(specificationSnapshot({}, null)).toBeNull();
  });
});

describe("freshnessOf", () => {
  const now = new Date("2026-11-17T12:00:00Z");
  const hoursAgo = (hours: number) =>
    new Date(now.getTime() - hours * 3_600_000);

  it("follows the documented thresholds", () => {
    expect(freshnessOf(hoursAgo(1), now)).toBe("LIVE");
    expect(freshnessOf(hoursAgo(6), now)).toBe("RECENT");
    expect(freshnessOf(hoursAgo(23), now)).toBe("RECENT");
    expect(freshnessOf(hoursAgo(24), now)).toBe("STALE");
    expect(freshnessOf(hoursAgo(72), now)).toBe("STALE");
    expect(freshnessOf(hoursAgo(73), now)).toBe("VERY_STALE");
  });
});
