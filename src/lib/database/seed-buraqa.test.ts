import { describe, expect, it } from "vitest";
import { BURAQA_PRODUCTS, BURAQA_SUPPLIER } from "./seed-buraqa";

describe("Buraqa seed data", () => {
  it("contains the supplier identity and every catalog row", () => {
    expect(BURAQA_SUPPLIER.slug).toBe("buraqa-star-computer");
    expect(BURAQA_SUPPLIER.website).toBe("https://buraqauae.com/");
    expect(BURAQA_PRODUCTS.length).toBe(27);
    expect(new Set(BURAQA_PRODUCTS.map((product) => product.recordId)).size).toBe(
      BURAQA_PRODUCTS.length,
    );
    expect(BURAQA_PRODUCTS.every((product) => product.brand === "HP")).toBe(true);
  });
});
