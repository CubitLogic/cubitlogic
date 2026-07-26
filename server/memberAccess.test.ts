import { describe, expect, it } from "vitest";
import { resolveMemberAiAccess } from "./memberAccess";

describe("resolveMemberAiAccess", () => {
  it("keeps free accounts enabled with the normal allowance", () => {
    expect(resolveMemberAiAccess("automatic", "free")).toEqual({
      mode: "automatic",
      enabled: true,
      unlimited: false,
      source: "free",
    });
  });

  it("automatically enhances active supporter accounts", () => {
    expect(resolveMemberAiAccess("automatic", "pro")).toEqual({
      mode: "automatic",
      enabled: true,
      unlimited: true,
      source: "supporter",
    });
  });

  it("lets the owner explicitly enable or disable access", () => {
    expect(resolveMemberAiAccess("enabled", "free").unlimited).toBe(true);
    expect(resolveMemberAiAccess("disabled", "pro").enabled).toBe(false);
  });
});
