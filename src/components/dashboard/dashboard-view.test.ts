import { describe, expect, it } from "vitest";
import { getDashboardCopy } from "./dashboard-view";

describe("getDashboardCopy", () => {
  it("returns role-specific dashboard guidance", () => {
    expect(getDashboardCopy("BUYER").primaryAction).toBe("Browse live market");
    expect(getDashboardCopy("SUPPLIER").primaryAction).toBe("List your stock");
    expect(getDashboardCopy("BUYER").eyebrow).toBe("Buyer workspace");
  });
});
