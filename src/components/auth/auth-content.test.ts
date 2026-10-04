import { describe, expect, it } from "vitest";
import { authRoleContent } from "./auth-content";

describe("authRoleContent", () => {
  it("provides distinct buyer and seller value propositions", () => {
    expect(authRoleContent.buyer.title).toBe("Buy with confidence");
    expect(authRoleContent.seller.title).toBe("Reach ready buyers");
    expect(authRoleContent.buyer.features).toHaveLength(3);
    expect(authRoleContent.seller.features).toHaveLength(3);
    expect(authRoleContent.buyer.features).not.toEqual(
      authRoleContent.seller.features,
    );
  });
});
