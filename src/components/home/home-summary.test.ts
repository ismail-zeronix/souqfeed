import { describe, expect, it } from "vitest";
import { HOME_SECTION_LABELS } from "@/components/home/home-summary";

describe("home page section order", () => {
  it("keeps the marketplace discovery flow in reference order", () => {
    expect(HOME_SECTION_LABELS).toEqual([
      "hero",
      "categories",
      "offers",
      "how-it-works",
      "supplier-cta",
      "feedback",
      "location-links",
    ]);
  });
});
