import { describe, expect, it } from "vitest";
import { createLogger } from "./logger";

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
