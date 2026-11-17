import { describe, expect, it } from "vitest";
import { aliasInputSchema, productInputSchema } from "./validation";

const BRAND = "7f3c1b52-5f0e-4a51-9a3b-3f2f8f6b1c11";
const VALID = { brandId: BRAND, title: "ThinkPad E14 Gen 7" };

describe("productInputSchema", () => {
  it("needs only a brand and a title", () => {
    expect(productInputSchema.safeParse(VALID).success).toBe(true);
  });

  it("rejects a missing brand or title", () => {
    expect(
      productInputSchema.safeParse({ ...VALID, brandId: "" }).success,
    ).toBe(false);
    expect(productInputSchema.safeParse({ ...VALID, title: " " }).success).toBe(
      false,
    );
  });

  it("stores blank optional fields as null, never as invented values", () => {
    const parsed = productInputSchema.parse({
      ...VALID,
      categoryId: "",
      family: "",
      model: " ",
      partNumber: "",
      cpu: "",
    });
    expect(parsed.categoryId).toBeNull();
    expect(parsed.family).toBeNull();
    expect(parsed.model).toBeNull();
    expect(parsed.partNumber).toBeNull();
    expect(parsed.cpu).toBeNull();
  });

  it("normalizes the part number", () => {
    expect(
      productInputSchema.parse({ ...VALID, partNumber: " 21u2 0063gr " })
        .partNumber,
    ).toBe("21U20063GR");
  });

  it("rejects a malformed category", () => {
    expect(
      productInputSchema.safeParse({ ...VALID, categoryId: "laptops" }).success,
    ).toBe(false);
  });
});

describe("aliasInputSchema", () => {
  it("tidies spacing", () => {
    expect(aliasInputSchema.parse({ alias: "  Core   Ultra 7 " }).alias).toBe(
      "Core Ultra 7",
    );
  });

  it("rejects an alias that is only spaces", () => {
    expect(aliasInputSchema.safeParse({ alias: "   " }).success).toBe(false);
  });
});
