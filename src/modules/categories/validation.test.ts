import { describe, expect, it } from "vitest";
import { categoryInputSchema } from "./validation";

const PARENT = "7f3c1b52-5f0e-4a51-9a3b-3f2f8f6b1c11";

describe("categoryInputSchema", () => {
  it("treats a blank parent as top level", () => {
    const parsed = categoryInputSchema.parse({
      name: " Gaming ",
      parentId: "",
    });
    expect(parsed).toEqual({ name: "Gaming", parentId: null });
  });

  it("keeps a valid parent", () => {
    expect(
      categoryInputSchema.parse({ name: "Gaming", parentId: PARENT }).parentId,
    ).toBe(PARENT);
  });

  it("rejects a malformed parent and a blank name", () => {
    expect(
      categoryInputSchema.safeParse({ name: "Gaming", parentId: "laptops" })
        .success,
    ).toBe(false);
    expect(categoryInputSchema.safeParse({ name: "" }).success).toBe(false);
  });
});
