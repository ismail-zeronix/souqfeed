import { describe, expect, it } from "vitest";
import {
  specLabel,
  specTemplateFor,
} from "@/modules/categories/spec-templates";
import { renderManualOffer } from "./render";
import { parseManualOffer } from "./validation";

const CATEGORY = "0b9d5e3a-1c2f-4a6b-8d7e-9f0a1b2c3d4e";
const BRAND = "1b9d5e3a-1c2f-4a6b-8d7e-9f0a1b2c3d4e";
const PRODUCT = "2b9d5e3a-1c2f-4a6b-8d7e-9f0a1b2c3d4e";

const base = {
  categoryId: CATEGORY,
  brandId: BRAND,
  productId: PRODUCT,
  priceMode: "fixed",
  price: "1,850.50",
  currency: "AED",
  quantity: "20",
  condition: "NEW",
  warranty: " 1 year ",
  notes: "",
};

describe("parseManualOffer", () => {
  it("reads a catalog product offer", () => {
    const result = parseManualOffer(base, specTemplateFor("laptops"));
    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({
        productId: PRODUCT,
        model: null,
        price: 1850.5,
        priceType: "FIXED",
        quantity: 20,
        condition: "NEW",
        warranty: "1 year",
        notes: null,
        specs: {},
        extraSpecs: {},
      }),
    });
  });

  it("keeps only the category's spec fields for a described product", () => {
    const result = parseManualOffer(
      {
        ...base,
        productId: "",
        model: "Purple 4TB",
        partNumber: "wd 43purz",
        spec_capacity: "4TB",
        spec_interface: "SATA",
        spec_cpu: "ignored: not a storage field",
        spec_evil: "ignored",
      },
      specTemplateFor("storage"),
    );
    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({
        productId: null,
        model: "Purple 4TB",
        partNumber: "WD43PURZ",
        specs: {},
        extraSpecs: { capacity: "4TB", interface: "SATA" },
      }),
    });
  });

  it("stores detected spec keys in their own columns", () => {
    const result = parseManualOffer(
      {
        ...base,
        productId: "",
        model: "E14",
        spec_cpu: "i7",
        spec_keyboard: "Arabic",
      },
      specTemplateFor("laptops"),
    );
    expect(result.ok && result.data.specs).toEqual({ cpu: "i7" });
    expect(result.ok && result.data.extraSpecs).toEqual({ keyboard: "Arabic" });
  });

  it("needs a category only when describing a product", () => {
    expect(parseManualOffer({ ...base, categoryId: "" }, []).ok).toBe(true);
    expect(
      parseManualOffer(
        { ...base, categoryId: "", productId: "", model: "X1" },
        [],
      ),
    ).toEqual({ ok: false, fieldErrors: { categoryId: expect.any(String) } });
  });

  it("needs a product or a model", () => {
    const result = parseManualOffer(
      { ...base, productId: "" },
      specTemplateFor("laptops"),
    );
    expect(result).toEqual({
      ok: false,
      fieldErrors: { model: expect.any(String) },
    });
  });

  it("accepts ask-for-price without a price or quantity", () => {
    const result = parseManualOffer(
      { ...base, priceMode: "ask", price: "", quantity: "", condition: "" },
      [],
    );
    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({
        price: null,
        priceType: "ASK",
        quantity: null,
        condition: null,
      }),
    });
  });

  it("rejects bad numbers instead of guessing", () => {
    const result = parseManualOffer(
      { ...base, price: "12abc", quantity: "2.5" },
      [],
    );
    expect(result).toEqual({
      ok: false,
      fieldErrors: { price: expect.any(String), quantity: expect.any(String) },
    });
    expect(parseManualOffer({ ...base, price: "" }, []).ok).toBe(false);
    expect(parseManualOffer({ ...base, quantity: "0" }, []).ok).toBe(false);
  });

  it("rejects unknown conditions and currencies", () => {
    const result = parseManualOffer(
      { ...base, condition: "MINT", currency: "EUR" },
      [],
    );
    expect(result.ok).toBe(false);
  });
});

describe("renderManualOffer", () => {
  it("writes one fact per line", () => {
    const parsed = parseManualOffer(
      { ...base, notes: "Sealed box, Arabic keyboard" },
      [],
    );
    if (!parsed.ok) throw new Error("expected valid input");
    expect(
      renderManualOffer(parsed.data, {
        brandName: "Lenovo",
        title: "ThinkPad E14 Gen 5",
        partNumber: "21JK0083AD",
      }),
    ).toEqual({
      rawLine: "Lenovo ThinkPad E14 Gen 5 (21JK0083AD)",
      rawText: [
        "Lenovo ThinkPad E14 Gen 5 (21JK0083AD)",
        "Condition: New",
        "Price: AED 1,850.50",
        "Quantity: 20",
        "Warranty: 1 year",
        "Notes: Sealed box, Arabic keyboard",
      ].join("\n"),
    });
  });

  it("describes an unlisted product with its specs and no invented price", () => {
    const parsed = parseManualOffer(
      {
        ...base,
        productId: "",
        model: "Purple 4TB",
        spec_capacity: "4TB",
        priceMode: "ask",
        price: "",
        quantity: "",
        condition: "",
        warranty: "",
      },
      specTemplateFor("storage"),
    );
    if (!parsed.ok) throw new Error("expected valid input");
    expect(
      renderManualOffer(parsed.data, {
        brandName: "WD",
        title: "",
        partNumber: null,
      }).rawText,
    ).toBe("WD Purple 4TB\nSpecs: Capacity: 4TB\nPrice: Ask");
  });

  it("doesn't repeat a brand already in the title", () => {
    const parsed = parseManualOffer(base, []);
    if (!parsed.ok) throw new Error("expected valid input");
    expect(
      renderManualOffer(parsed.data, {
        brandName: "HP",
        title: "HP ProBook 450 G10",
        partNumber: null,
      }).rawLine,
    ).toBe("HP ProBook 450 G10");
  });
});

describe("specLabel", () => {
  it("labels template and unknown keys", () => {
    expect(specLabel("refreshRate")).toBe("Refresh rate");
    expect(specLabel("display")).toBe("Display");
    expect(specLabel("someNewKey")).toBe("Some New Key");
    expect(specLabel("interface")).toBe("Interface");
  });

  it("renders specs with the category's own labels", () => {
    const template = specTemplateFor("components");
    const parsed = parseManualOffer(
      { ...base, productId: "", model: "X", spec_interface: "DDR5" },
      template,
    );
    if (!parsed.ok) throw new Error("expected valid input");
    expect(
      renderManualOffer(
        parsed.data,
        { brandName: "Kingston", title: "", partNumber: null },
        template,
      ).rawText,
    ).toContain("Specs: Socket / interface: DDR5");
  });
});
