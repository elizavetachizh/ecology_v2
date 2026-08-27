import { describe, expect, it } from "vitest";
import type { Tenant } from "./tenant.types";
import {
  filterTenantTree,
  flattenTenantTree,
  tenantLabel,
} from "./flatten-tenant-tree";

const child: Tenant = {
  id: "child",
  realm: "mingas",
  name: "Филиал Старобинский",
  short: "ТБЗ Старобинский",
  parent_id: "parent",
  children: [],
};

const parent: Tenant = {
  id: "parent",
  realm: "mingas",
  name: 'УП "Мингаз"',
  short: 'УП "Мингаз"',
  parent_id: null,
  children: [child],
};

const other: Tenant = {
  id: "other",
  realm: "mingas",
  name: "Другая организация",
  short: "Другая",
  parent_id: null,
  children: [],
};

describe("tenantLabel", () => {
  it("prefers short name when present", () => {
    expect(tenantLabel(child)).toBe("ТБЗ Старобинский");
    expect(tenantLabel({ name: "Full", short: "  " })).toBe("Full");
  });
});

describe("flattenTenantTree", () => {
  it("keeps DFS order and depth", () => {
    const nodes = flattenTenantTree([parent, other]);
    expect(nodes.map((node) => [node.tenant.id, node.depth])).toEqual([
      ["parent", 0],
      ["child", 1],
      ["other", 0],
    ]);
  });
});

describe("filterTenantTree", () => {
  it("returns the full tree when query is empty", () => {
    expect(
      filterTenantTree([parent, other], "  ").map((n) => n.tenant.id),
    ).toEqual(["parent", "child", "other"]);
  });

  it("keeps ancestors when a child matches", () => {
    const nodes = filterTenantTree([parent, other], "старобин");
    expect(nodes.map((node) => node.tenant.id)).toEqual(["parent", "child"]);
  });

  it("keeps descendants when a parent matches", () => {
    const nodes = filterTenantTree([parent, other], "мингаз");
    expect(nodes.map((node) => node.tenant.id)).toEqual(["parent", "child"]);
  });

  it("returns empty when nothing matches", () => {
    expect(filterTenantTree([parent, other], "нет такого")).toEqual([]);
  });
});
