import { describe, expect, it } from "vitest";
import { supplierProfileInputSchema } from "./validation";

const VALID = {
  companyName: "Test Supplier",
  whatsappNumber: "+971500000000",
};

function errorFor(input: Record<string, unknown>, field: string) {
  const result = supplierProfileInputSchema.safeParse({ ...VALID, ...input });
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("supplierProfileInputSchema", () => {
  it("accepts a minimal valid submission", () => {
    expect(supplierProfileInputSchema.safeParse(VALID).success).toBe(true);
  });

  it("rejects a missing company name", () => {
    expect(errorFor({ companyName: "   " }, "companyName")).toBeDefined();
  });

  it("rejects a missing WhatsApp number", () => {
    expect(errorFor({ whatsappNumber: "" }, "whatsappNumber")).toBeDefined();
  });

  it("requires a country code on the WhatsApp number", () => {
    expect(
      errorFor({ whatsappNumber: "0501234567" }, "whatsappNumber"),
    ).toBeDefined();
    expect(
      errorFor({ whatsappNumber: "+971 50 123 4567" }, "whatsappNumber"),
    ).toBeUndefined();
  });

  it("converts empty optional fields to null", () => {
    const parsed = supplierProfileInputSchema.parse({
      ...VALID,
      phone: "",
      email: "",
      website: "",
      googleMapsUrl: "",
      description: "   ",
    });
    expect(parsed.phone).toBeNull();
    expect(parsed.email).toBeNull();
    expect(parsed.website).toBeNull();
    expect(parsed.googleMapsUrl).toBeNull();
    expect(parsed.description).toBeNull();
  });

  it("trims whitespace from text fields", () => {
    const parsed = supplierProfileInputSchema.parse({
      ...VALID,
      companyName: "  Test Supplier  ",
    });
    expect(parsed.companyName).toBe("Test Supplier");
  });

  it("defaults brandIds/categoryIds to empty arrays when omitted", () => {
    const parsed = supplierProfileInputSchema.parse(VALID);
    expect(parsed.brandIds).toEqual([]);
    expect(parsed.categoryIds).toEqual([]);
  });

  it("rejects script URLs that would run when clicked on the public profile", () => {
    for (const url of [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "data:text/html,<script>alert(1)</script>",
    ]) {
      expect(errorFor({ website: url }, "website")).toBeDefined();
      expect(errorFor({ googleMapsUrl: url }, "googleMapsUrl")).toBeDefined();
    }
  });

  it("keeps http(s) URLs and treats a bare domain as https", () => {
    expect(
      supplierProfileInputSchema.parse({
        ...VALID,
        website: "http://example.com/a",
      }).website,
    ).toBe("http://example.com/a");
    expect(
      supplierProfileInputSchema.parse({ ...VALID, website: "example.com" })
        .website,
    ).toBe("https://example.com");
  });

  it("rejects malformed email and phone values", () => {
    expect(errorFor({ email: "not-an-email" }, "email")).toBeDefined();
    expect(errorFor({ phone: "call me" }, "phone")).toBeDefined();
    expect(errorFor({ phone: "12" }, "phone")).toBeDefined();
    expect(errorFor({ phone: "04 352 6611" }, "phone")).toBeUndefined();
  });

  it("rejects non-UUID association ids and removes duplicates", () => {
    expect(errorFor({ brandIds: ["brand-hp"] }, "brandIds")).toBeDefined();
    const id = "7f3c1b52-5f0e-4a51-9a3b-3f2f8f6b1c11";
    expect(
      supplierProfileInputSchema.parse({ ...VALID, brandIds: [id, id] })
        .brandIds,
    ).toEqual([id]);
  });

  it("never outputs verified, active, slug, or userId, even if submitted", () => {
    const parsed = supplierProfileInputSchema.parse({
      ...VALID,
      verified: true,
      active: false,
      slug: "stolen-slug",
      userId: "someone-else",
    });
    expect(parsed).not.toHaveProperty("verified");
    expect(parsed).not.toHaveProperty("active");
    expect(parsed).not.toHaveProperty("slug");
    expect(parsed).not.toHaveProperty("userId");
  });
});
