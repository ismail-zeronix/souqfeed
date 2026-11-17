import { describe, expect, it } from "vitest";
import { brandInputSchema } from "./validation";

describe("brandInputSchema", () => {
  it("accepts and trims a name", () => {
    expect(brandInputSchema.parse({ name: "  Lenovo " }).name).toBe("Lenovo");
  });

  it("rejects a blank name", () => {
    expect(brandInputSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("rejects a name with nothing to build a slug from", () => {
    expect(brandInputSchema.safeParse({ name: "!!!" }).success).toBe(false);
  });

  it("ignores anything other than the name", () => {
    const parsed = brandInputSchema.parse({ name: "HP", slug: "hacked" });
    expect(parsed).not.toHaveProperty("slug");
  });
});
