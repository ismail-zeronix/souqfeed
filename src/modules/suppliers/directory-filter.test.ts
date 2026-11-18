import { describe, expect, it } from "vitest";
import {
  directoryOptions,
  filterDirectory,
  parseDirectoryParams,
  type DirectorySupplier,
} from "./directory-filter";

function supplier(over: Partial<DirectorySupplier>): DirectorySupplier {
  return {
    id: over.slug ?? "x",
    slug: "x",
    companyName: "X",
    verified: false,
    locationName: "Deira",
    activeOfferCount: 0,
    categoryNames: [],
    description: null,
    whatsappNumber: "+971500000000",
    ...over,
  };
}

const list = [
  supplier({
    slug: "a",
    companyName: "Al Hadi Computers",
    verified: true,
    locationName: "Bur Dubai",
    activeOfferCount: 5,
    categoryNames: ["Laptops", "Storage"],
  }),
  supplier({
    slug: "b",
    companyName: "Skyline Trading",
    locationName: "Deira",
    activeOfferCount: 9,
    categoryNames: ["Networking"],
  }),
  supplier({
    slug: "c",
    companyName: "Alpha Systems",
    locationName: "Deira",
    activeOfferCount: 9,
  }),
];

const base = parseDirectoryParams({});

describe("parseDirectoryParams", () => {
  it("defaults to most offers, no filters", () => {
    expect(base).toEqual({
      q: "",
      category: "",
      location: "",
      verifiedOnly: false,
      sort: "offers",
    });
  });

  it("reads each field and ignores unknown sorts", () => {
    expect(
      parseDirectoryParams({
        q: " thinkpad ",
        verified: "1",
        sort: "banana",
        category: ["Laptops", "x"],
      }),
    ).toMatchObject({
      q: "thinkpad",
      verifiedOnly: true,
      sort: "offers",
      category: "Laptops",
    });
  });
});

describe("filterDirectory", () => {
  it("sorts by live offers, ties A to Z", () => {
    expect(filterDirectory(list, base).map((s) => s.slug)).toEqual([
      "c",
      "b",
      "a",
    ]);
  });

  it("sorts A to Z on request", () => {
    expect(
      filterDirectory(list, { ...base, sort: "name" }).map((s) => s.slug),
    ).toEqual(["a", "c", "b"]);
  });

  it("filters by verified, location and category", () => {
    expect(
      filterDirectory(list, { ...base, verifiedOnly: true }).map((s) => s.slug),
    ).toEqual(["a"]);
    expect(
      filterDirectory(list, { ...base, location: "Deira" }).map((s) => s.slug),
    ).toEqual(["c", "b"]);
    expect(
      filterDirectory(list, { ...base, category: "Storage" }).map(
        (s) => s.slug,
      ),
    ).toEqual(["a"]);
  });

  it("searches name, location and categories, ignoring case", () => {
    expect(
      filterDirectory(list, { ...base, q: "NETWORK" }).map((s) => s.slug),
    ).toEqual(["b"]);
    expect(
      filterDirectory(list, { ...base, q: "bur dubai" }).map((s) => s.slug),
    ).toEqual(["a"]);
  });
});

describe("directoryOptions", () => {
  it("lists each location and category once, sorted", () => {
    expect(directoryOptions(list)).toEqual({
      locations: ["Bur Dubai", "Deira"],
      categories: ["Laptops", "Networking", "Storage"],
    });
  });
});
