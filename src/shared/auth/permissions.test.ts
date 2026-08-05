import { describe, expect, it } from "vitest";
import { can, getRealmRoles, hasAnyRole, hasRole } from "./permissions";

describe("realm permissions", () => {
  const roles = ["waste.read", "report.generate"];

  it("reads roles from token claims", () => {
    expect(
      getRealmRoles({ realm_access: { roles }, exp: 1 }),
    ).toEqual(roles);
  });

  it("checks individual and alternative roles", () => {
    expect(hasRole(roles, "waste.read")).toBe(true);
    expect(hasAnyRole(roles, ["admin", "report.generate"])).toBe(true);
    expect(can(roles, "organization.settings.manage")).toBe(false);
  });
});
