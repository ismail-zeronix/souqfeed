import { describe, expect, it } from "vitest";
import { WTB_SECTION_TITLE } from "@/components/home/wtb-requests";

describe("WTB requests section", () => {
  it("uses the buyer-request heading from the homepage reference", () => {
    expect(WTB_SECTION_TITLE).toBe("Latest WTB Requests");
  });
});
