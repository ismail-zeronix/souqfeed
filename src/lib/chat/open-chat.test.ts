import { describe, expect, it } from "vitest";
import { buildChatMessage } from "./open-chat";

describe("buildChatMessage", () => {
  it("names the product and the supplier", () => {
    expect(
      buildChatMessage({
        supplierName: "Al Hadi Computers",
        productTitle: "Lenovo ThinkPad E14 Gen 7",
        source: "Offer card",
      }),
    ).toBe(
      "Hi, I'm interested in Lenovo ThinkPad E14 Gen 7 from Al Hadi Computers on SouqFeed. Is it available, and what's your best price?",
    );
  });

  it("falls back to the supplier's stock when there is no product", () => {
    expect(
      buildChatMessage({ supplierName: "Skyline Trading", source: "Profile" }),
    ).toContain("stock from Skyline Trading");
  });
});
