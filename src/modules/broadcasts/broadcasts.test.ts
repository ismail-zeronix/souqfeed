import { describe, expect, it } from "vitest";
import { BROADCAST_STATUSES, canTransition, isBroadcastStatus } from "./status";
import {
  broadcastInputSchema,
  countBroadcastLines,
  MAX_BROADCAST_LENGTH,
} from "./validation";

describe("broadcast status lifecycle", () => {
  it("allows the forward path from draft to published", () => {
    expect(canTransition("DRAFT", "PROCESSING")).toBe(true);
    expect(canTransition("PROCESSING", "REVIEW")).toBe(true);
    expect(canTransition("REVIEW", "PUBLISHED")).toBe(true);
  });

  it("allows a failed broadcast to be retried", () => {
    expect(canTransition("PROCESSING", "FAILED")).toBe(true);
    expect(canTransition("FAILED", "PROCESSING")).toBe(true);
  });

  it("never leaves PUBLISHED", () => {
    for (const status of BROADCAST_STATUSES) {
      expect(canTransition("PUBLISHED", status)).toBe(false);
    }
  });

  it("rejects skipping review or going backwards", () => {
    expect(canTransition("PROCESSING", "PUBLISHED")).toBe(false);
    expect(canTransition("REVIEW", "PROCESSING")).toBe(false);
    expect(canTransition("FAILED", "PUBLISHED")).toBe(false);
  });

  it("recognises only known statuses", () => {
    expect(isBroadcastStatus("REVIEW")).toBe(true);
    for (const value of ["review", "", "DONE", null, 1]) {
      expect(isBroadcastStatus(value)).toBe(false);
    }
  });
});

describe("broadcastInputSchema", () => {
  it("keeps the text exactly as pasted", () => {
    const rawText = "  HP 840 G8 i5 16/512 @1850\r\n\r\nDELL 5440 x10  ";
    const result = broadcastInputSchema.parse({ rawText });
    expect(result.rawText).toBe(rawText);
  });

  it("rejects blank text", () => {
    for (const rawText of ["", "   ", "\n\n\t"]) {
      expect(broadcastInputSchema.safeParse({ rawText }).success).toBe(false);
    }
  });

  it("rejects text over the length limit", () => {
    const rawText = "x".repeat(MAX_BROADCAST_LENGTH + 1);
    expect(broadcastInputSchema.safeParse({ rawText }).success).toBe(false);
    expect(
      broadcastInputSchema.safeParse({ rawText: rawText.slice(1) }).success,
    ).toBe(true);
  });
});

describe("countBroadcastLines", () => {
  it("counts non-blank lines across line-ending styles", () => {
    expect(countBroadcastLines("a\r\nb\n\nc\r  \nd")).toBe(4);
    expect(countBroadcastLines("   ")).toBe(0);
  });
});
