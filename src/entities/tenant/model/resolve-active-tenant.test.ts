import { describe, expect, it } from "vitest";
import type { Tenant } from "./tenant.types";
import { flattenTenants, resolveActiveTenantId } from "./resolve-active-tenant";

const parent: Tenant = {
  id: "parent",
  realm: "mingas",
  name: "Parent",
  short: "P",
  parent_id: null,
  children: [
    {
      id: "child",
      realm: "mingas",
      name: "Child",
      short: "C",
      parent_id: "parent",
      children: [],
    },
  ],
};

const two: Tenant[] = [
  { ...parent, children: [] },
  {
    id: "other",
    realm: "mingas",
    name: "Other",
    short: "O",
    parent_id: null,
    children: [],
  },
];

describe("flattenTenants", () => {
  it("includes nested children", () => {
    expect(flattenTenants([parent]).map((tenant) => tenant.id)).toEqual([
      "parent",
      "child",
    ]);
  });
});

describe("resolveActiveTenantId", () => {
  it("prefers a known URL tenant over storage", () => {
    expect(resolveActiveTenantId(two, "other", "parent")).toBe("other");
  });

  it("falls back to storage when URL is missing or unknown", () => {
    expect(resolveActiveTenantId(two, null, "parent")).toBe("parent");
    expect(resolveActiveTenantId(two, "missing", "parent")).toBe("parent");
  });

  it("auto-selects the only tenant", () => {
    expect(resolveActiveTenantId([two[0]!], null, null)).toBe("parent");
  });

  it("stays null when several tenants and nothing valid", () => {
    expect(resolveActiveTenantId(two, "missing", null)).toBeNull();
  });
});
