import { describe, expect, it } from "vitest";
import {
  getSouqFeedAgentAsset,
  type SouqFeedAgentState,
} from "./souqfeed-agent";

describe("getSouqFeedAgentAsset", () => {
  it.each([
    ["idle", "/brand/mascot/souqfeed_mascot_idle.webp"],
    ["loading", "/brand/mascot/souqfeed_mascot_loading.webp"],
    ["searching", "/brand/mascot/souqfeed_mascot_searching.webp"],
    ["thinking", "/brand/mascot/souqfeed_mascot_thinking.webp"],
    ["success", "/brand/mascot/souqfeed_mascot_success.webp"],
    ["happy", "/brand/mascot/souqfeed_mascot_happy.webp"],
    ["error", "/brand/mascot/souqfeed_mascot_error.webp"],
    ["waving", "/brand/mascot/souqfeed_mascot_waving.webp"],
  ] satisfies [SouqFeedAgentState, string][])(
    "maps %s to its matching responsive asset",
    (state, expectedAsset) => {
      expect(getSouqFeedAgentAsset(state)).toBe(expectedAsset);
    },
  );
});
