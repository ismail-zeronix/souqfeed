import { describe, expect, it } from "vitest";
import { parseLine } from "./parse-line";
import {
  MAX_ITEMS_PER_BROADCAST,
  RuleBasedBroadcastParser,
} from "./rule-based-parser";

const BRANDS = ["HP", "Dell", "Lenovo", "Apple", "Acer", "Samsung", "WD"];
const parser = new RuleBasedBroadcastParser();
const parse = (text: string) => parser.parse(text, { brands: BRANDS });
const line = (text: string) => parseLine(text, BRANDS);

describe("parseLine: the documented formats", () => {
  it("reads a typical one-line offer", () => {
    expect(
      line("HP EliteBook 840 G8 i5-1145G7 16/512 x20 @1850"),
    ).toMatchObject({
      brand: "HP",
      model: "EliteBook 840 G8",
      cpu: "Intel Core i5-1145G7",
      ram: "16GB",
      storage: "512GB",
      quantity: 20,
      price: 1850,
      currency: "AED",
      priceType: "FIXED",
    });
  });

  it("reads separate RAM and storage, PCS, and a currency prefix", () => {
    expect(
      line("Dell Latitude 5440 i7-1365U 16GB 512GB 10PCS AED 2,450"),
    ).toMatchObject({
      brand: "Dell",
      model: "Latitude 5440",
      cpu: "Intel Core i7-1365U",
      ram: "16GB",
      storage: "512GB",
      quantity: 10,
      price: 2450,
      currency: "AED",
    });
  });

  it.each([
    ["@1850", 1850, "AED"],
    ["@ 1,850", 1850, "AED"],
    ["AED1850", 1850, "AED"],
    ["1850 AED", 1850, "AED"],
    ["DHS 1850", 1850, "AED"],
    ["1850/-", 1850, "AED"],
    ["Price: 1850", 1850, "AED"],
    ["$500", 500, "USD"],
    ["USD 500", 500, "USD"],
  ])("reads the price in %s", (text, price, currency) => {
    expect(line(`HP 840 G8 i5 16/512 ${text}`)).toMatchObject({
      price,
      currency,
      priceType: "FIXED",
    });
  });

  it.each(["ASK", "CALL", "BEST PRICE", "PM", "price on request"])(
    "treats %s as ask-for-price",
    (text) => {
      expect(line(`HP 840 G8 i5 16/512 ${text}`)).toMatchObject({
        price: null,
        currency: null,
        priceType: "ASK",
      });
    },
  );

  it.each([
    ["100PCS", 100],
    ["100 PCS", 100],
    ["QTY100", 100],
    ["QTY: 50", 50],
    ["x20", 20],
    ["25 units", 25],
    ["30NOS", 30],
  ])("reads the quantity in %s", (text, quantity) => {
    expect(line(`HP 840 G8 i5 16/512 ${text}`).quantity).toBe(quantity);
  });

  it("leaves unknown fields null (Rule 10)", () => {
    expect(line("HP EliteBook 840 G8")).toMatchObject({
      cpu: null,
      ram: null,
      storage: null,
      gpu: null,
      display: null,
      os: null,
      quantity: null,
      price: null,
      currency: null,
      priceType: "UNKNOWN",
      partNumber: null,
    });
  });
});

describe("parseLine: real market lines", () => {
  it("reads a Buraqa catalogue line", () => {
    expect(
      line('HP 15-FD0027ST — I3-N305, 8GB, 256SSD, 15.6", W11'),
    ).toMatchObject({
      brand: "HP",
      model: "15-FD0027ST",
      partNumber: "15-FD0027ST",
      cpu: "Intel Core i3-N305",
      ram: "8GB",
      storage: "256GB SSD",
      display: '15.6"',
      os: "Windows 11",
    });
  });

  it("reads Core Ultra, a dedicated GPU, and TB storage", () => {
    expect(
      line(
        'HP PROBOOK 4 G1i 16 — ULTRA 7-255H, 16GB, 1TBSSD, RTX3050 4GB, 16", DOS',
      ),
    ).toMatchObject({
      brand: "HP",
      cpu: "Intel Core Ultra 7 255H",
      gpu: "NVIDIA RTX 3050 4GB",
      ram: "16GB",
      storage: "1TB SSD",
      display: '16"',
      os: "DOS",
    });
  });

  it("reads Core Series 1 and display descriptors, and drops colour words", () => {
    expect(
      line('HP 250RG10 — CORE5-120U, 16GB, 512SSD, 15.6" FHD, DOS, SIL'),
    ).toMatchObject({
      cpu: "Intel Core 5 120U",
      display: '15.6" FHD',
      model: "250RG10",
    });
  });

  it("reads 'CORE ULTRA5-226V' and '14\" 2K, WIN 11'", () => {
    expect(
      line(
        'HP OMNIBOOK XFLIP 14-FM0013DX — CORE ULTRA5-226V, 16GB, 512 SSD, 14" 2K, WIN 11, SILVER',
      ),
    ).toMatchObject({
      cpu: "Intel Core Ultra 5 226V",
      storage: "512GB SSD",
      display: '14" 2K',
      os: "Windows 11",
      model: "OMNIBOOK XFLIP 14-FM0013DX",
    });
  });

  it("infers the brand from a family name and keeps the family in the model", () => {
    expect(line("ThinkPad T14 Gen 4 i7-1365U 32/1TB W11P @4200")).toMatchObject(
      {
        brand: "Lenovo",
        model: "ThinkPad T14 Gen 4",
        ram: "32GB",
        storage: "1TB",
        os: "Windows 11 Pro",
      },
    );
  });

  it("reads Apple silicon only on Apple lines", () => {
    expect(line("MacBook Air M2 8/256 @3200")).toMatchObject({
      brand: "Apple",
      model: "MacBook Air",
      cpu: "Apple M2",
      ram: "8GB",
      storage: "256GB",
    });
    expect(line("Logitech M185 mouse x50 @25").cpu).toBeNull();
  });

  it("reads AMD processors", () => {
    expect(line("HP 255 G10 Ryzen 5 7530U 8/512 @1500").cpu).toBe(
      "AMD Ryzen 5 7530U",
    );
    expect(line("Dell 3535 R7 7730U 16/512").cpu).toBe("AMD Ryzen 7 7730U");
  });

  it("keeps WhatsApp formatting and emoji out of the fields", () => {
    expect(line("✅ *DELL* Latitude 5440 🔥 i5 8/256 x5 @1700")).toMatchObject({
      brand: "Dell",
      model: "Latitude 5440",
      cpu: "Intel Core i5",
      quantity: 5,
      price: 1700,
    });
  });

  it("reads labelled and unlabelled part numbers", () => {
    const labelled = line("HP 840 G10 P/N: 6A1Q9EA#ABV i5 16/512");
    expect(labelled.partNumber).toBe("6A1Q9EA#ABV");
    expect(labelled.model).toBe("840 G10");
    expect(line("Lenovo 21U20063GR ThinkPad E14 i5 16/512").partNumber).toBe(
      "21U20063GR",
    );
  });
});

describe("parseLine: false positives it must avoid", () => {
  it("doesn't read 'X1 Carbon' as a quantity", () => {
    const fields = line("Lenovo ThinkPad X1 Carbon Gen 11 i7 16/1TB @4500");
    expect(fields.quantity).toBeNull();
    expect(fields.model).toBe("ThinkPad X1 Carbon Gen 11");
  });

  it("doesn't read '20 in stock' as a screen size", () => {
    expect(line("HP 840 G8 i5 16/512 20 in stock").display).toBeNull();
  });

  it("doesn't read a date or a model number as memory", () => {
    const fields = line("Stock update 16/11 HP 450 G9");
    expect(fields.ram).toBeNull();
    expect(fields.storage).toBeNull();
  });

  it("never reads the same number twice", () => {
    const fields = line("HP 840 G8 i5 16GB 512GB @512");
    expect(fields.storage).toBe("512GB");
    expect(fields.price).toBe(512);
  });

  it("doesn't treat a generation or model token as a part number", () => {
    expect(line("HP ProBook 450-G9 i5 8/256").partNumber).toBeNull();
  });
});

describe("RuleBasedBroadcastParser", () => {
  it("reads one item per product line and skips greetings and contacts", () => {
    const result = parse(`*** STOCK UPDATE ***
Good morning all

HP EliteBook 840 G8 i5-1145G7 16/512 x20 @1850
Dell Latitude 5440 i7-1365U 16GB 512GB 10PCS AED 2,450
Lenovo ThinkPad E14 Gen 5 – ASK

Contact 050 123 4567`);
    expect(result.items.map((item) => item.brand)).toEqual([
      "HP",
      "Dell",
      "Lenovo",
    ]);
    expect(result.items[2]).toMatchObject({
      model: "ThinkPad E14 Gen 5",
      priceType: "ASK",
    });
    expect(result.skippedLines).toBe(3);
  });

  it("joins a multi-line product block and keeps every source line", () => {
    const block = `HP EliteBook 840 G8
Core i5 11th Gen
16GB RAM / 512GB SSD
Price: 1850 AED
Qty: 20`;
    const [item, ...rest] = parse(block).items;
    expect(rest).toHaveLength(0);
    expect(item).toMatchObject({
      rawLine: "HP EliteBook 840 G8",
      rawBlock: block,
      brand: "HP",
      model: "EliteBook 840 G8",
      cpu: "Intel Core i5 (11th Gen)",
      ram: "16GB",
      storage: "512GB SSD",
      price: 1850,
      currency: "AED",
      quantity: 20,
    });
  });

  it("treats a brand-only line as a section header for the models under it", () => {
    const result = parse(`*HP PROBOOK SERIES*
450 G9 i5-1235U 8/512 @1850
440 G10 i7-1355U 16/512 @2400

Dell 3520 i5 8/256 @1400`);
    expect(
      result.items.map(({ brand, model, price }) => ({ brand, model, price })),
    ).toEqual([
      { brand: "HP", model: "450 G9", price: 1850 },
      { brand: "HP", model: "440 G10", price: 2400 },
      { brand: "Dell", model: "3520", price: 1400 },
    ]);
    expect(result.skippedLines).toBe(1);
  });

  it("reads the Buraqa catalogue format, one product per line under headers", () => {
    const result = parse(`HP 15 / HP 250 SERIES
HP 15-FD0027ST — I3-N305, 8GB, 256SSD, 15.6", W11
HP 15-FD0123DX — I3-1315U, 8GB, 256SSD, 15.6" TOUCH, W11
HP PROBOOK SERIES
HP PROBOOK 450-G9 — I5-1235U, 8GB, 512SSD, 15.6" FHD, DOS, SILVER`);
    expect(result.items.map((item) => item.model)).toEqual([
      "15-FD0027ST",
      "15-FD0123DX",
      "PROBOOK 450-G9",
    ]);
    expect(result.items[1].display).toBe('15.6" Touch');
    expect(result.skippedLines).toBe(2);
  });

  it("finds nothing in a message with no products", () => {
    const result = parse(
      "Good morning\nThank you for your support\nCall 0501234567",
    );
    expect(result.items).toEqual([]);
    expect(result.skippedLines).toBe(3);
  });

  it("handles Windows line endings and keeps raw lines exact", () => {
    const [item] = parse("  HP 840 G8 i5 16/512 @1850  \r\n").items;
    expect(item.rawLine).toBe("  HP 840 G8 i5 16/512 @1850  ");
  });

  it("stops at the item limit", () => {
    const text = Array.from(
      { length: MAX_ITEMS_PER_BROADCAST + 20 },
      (_, i) => `HP 840 G8 i5 16/512 @${1000 + i}`,
    ).join("\n");
    expect(parse(text).items).toHaveLength(MAX_ITEMS_PER_BROADCAST);
  });
});
