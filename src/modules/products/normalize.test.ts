import { describe, expect, it } from "vitest";
import {
  mergeSpecifications,
  normalizeAlias,
  normalizePartNumber,
  normalizeTitle,
  readSpec,
} from "./normalize";

const BLANK = {
  cpu: null,
  ram: null,
  storage: null,
  gpu: null,
  display: null,
  os: null,
};

describe("normalizers", () => {
  it("reduces a title to lowercase words", () => {
    expect(normalizeTitle('HP 15-FD0027ST — I3-N305, 8GB, 15.6"')).toBe(
      "hp 15 fd0027st i3 n305 8gb 15 6",
    );
  });

  it("makes part numbers comparable", () => {
    expect(normalizePartNumber(" 21u2 0063gr ")).toBe("21U20063GR");
  });

  it("tidies alias spacing but keeps its case", () => {
    expect(normalizeAlias("  Core   Ultra 7 ")).toBe("Core Ultra 7");
  });
});

describe("mergeSpecifications", () => {
  it("returns null when nothing is known", () => {
    expect(mergeSpecifications(null, BLANK)).toBeNull();
    expect(mergeSpecifications({}, BLANK)).toBeNull();
  });

  it("stores only the fields that were filled in", () => {
    expect(mergeSpecifications(null, { ...BLANK, ram: "16GB" })).toEqual({
      ram: "16GB",
    });
  });

  it("removes a field that was cleared", () => {
    expect(
      mergeSpecifications({ ram: "16GB", cpu: "i7" }, { ...BLANK, cpu: "i7" }),
    ).toEqual({ cpu: "i7" });
  });

  it("keeps keys the form doesn't manage", () => {
    expect(
      mergeSpecifications({ recordId: "E904" }, { ...BLANK, ram: "8GB" }),
    ).toEqual({ recordId: "E904", ram: "8GB" });
  });

  it("does not modify the stored object", () => {
    const stored = { ram: "16GB" };
    mergeSpecifications(stored, BLANK);
    expect(stored).toEqual({ ram: "16GB" });
  });

  it("ignores stored values that aren't an object", () => {
    expect(mergeSpecifications("oops", { ...BLANK, os: "DOS" })).toEqual({
      os: "DOS",
    });
    expect(mergeSpecifications([1, 2], BLANK)).toBeNull();
  });
});

describe("readSpec", () => {
  it("reads text and treats anything else as blank", () => {
    expect(readSpec({ ram: "8GB" }, "ram")).toBe("8GB");
    expect(readSpec({ ram: 8 }, "ram")).toBe("");
    expect(readSpec(null, "ram")).toBe("");
  });
});
