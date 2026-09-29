import { describe, expect, it } from "vitest";
import { createLogger, parseLogLevel } from "./logger";

describe("createLogger", () => {
  it("creates a logger at the requested level", () => {
    const logger = createLogger("debug");
    expect(logger.level).toBe("debug");
  });

  it("defaults to info when no level is given", () => {
    const logger = createLogger();
    expect(logger.level).toBe("info");
  });
});

describe("parseLogLevel", () => {
  it("passes through a recognized level", () => {
    expect(parseLogLevel("debug")).toBe("debug");
  });

  it("falls back to info for an empty string", () => {
    expect(parseLogLevel("")).toBe("info");
  });

  it("falls back to info for an unrecognized value", () => {
    expect(parseLogLevel("verbose")).toBe("info");
  });

  it("falls back to info when undefined", () => {
    expect(parseLogLevel(undefined)).toBe("info");
  });
});
