import { describe, expect, it } from "vitest";
import {
  can,
  flattenUserRoles,
  hasAnyRole,
  hasRole,
  rolesForKeyword,
  tenantKeywords,
} from "./permissions";

describe("user roles from /me", () => {
  const roles = {
    Mingas: ["editor"],
    Gomelgas: ["editor", "user"],
  };

  it("reads keywords and per-tenant roles", () => {
    expect(tenantKeywords(roles)).toEqual(["Mingas", "Gomelgas"]);
    expect(rolesForKeyword(roles, "Mingas")).toEqual(["editor"]);
    expect(rolesForKeyword(roles, "Unknown")).toEqual([]);
    expect(flattenUserRoles(roles)).toEqual(["editor", "user"]);
  });

  it("checks a role across tenants or in one keyword", () => {
    expect(hasRole(roles, "user")).toBe(true);
    expect(hasRole(roles, "user", "Mingas")).toBe(false);
    expect(hasRole(roles, "user", "Gomelgas")).toBe(true);
    expect(hasAnyRole(roles, ["admin", "editor"])).toBe(true);
    expect(can(roles, "admin")).toBe(false);
  });

  it("treats empty roles as no access", () => {
    expect(tenantKeywords({})).toEqual([]);
    expect(flattenUserRoles({})).toEqual([]);
    expect(hasRole({}, "editor")).toBe(false);
  });
});
