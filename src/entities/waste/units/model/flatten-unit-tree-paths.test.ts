import { describe, expect, it } from "vitest";
import {
  flattenUnitTreePaths,
  formatUnitPathLabel,
} from "./flatten-unit-tree-paths";
import type { Unit, UnitTree } from "./units.types";

function stubUnit(
  id: string,
  parentId: string | null,
  name = id,
  isPod9 = false,
): Unit {
  return {
    id,
    tenant_id: "t1",
    name,
    short_name: null,
    parent_id: parentId,
    is_pod9: isPod9,
    region: null,
    district: null,
    created_at: "",
    updated_at: "",
    created_by: {
      id: "u",
      username: "u",
      email: null,
      first_name: null,
      last_name: null,
    },
    updated_by: {
      id: "u",
      username: "u",
      email: null,
      first_name: null,
      last_name: null,
    },
  };
}

function stubTree(
  id: string,
  parentId: string | null,
  children: UnitTree[] = [],
  name = id,
  isPod9 = false,
): UnitTree {
  return { ...stubUnit(id, parentId, name, isPod9), children };
}

describe("formatUnitPathLabel", () => {
  it("joins names with arrows", () => {
    expect(
      formatUnitPathLabel([
        { name: "подразделение 1" },
        { name: "подразделение 1.1" },
        { name: "подразделение 1.1.1" },
      ]),
    ).toBe("подразделение 1 -> подразделение 1.1 -> подразделение 1.1.1");
  });

  it("returns a single name for a root node", () => {
    expect(formatUnitPathLabel([{ name: "корень" }])).toBe("корень");
  });
});

describe("flattenUnitTreePaths", () => {
  const forest = [
    stubTree(
      "dept-1",
      null,
      [
        stubTree(
          "dept-1.1",
          "dept-1",
          [
            stubTree("dept-1.1.1", "dept-1.1", [], "подразделение 1.1.1", true),
            stubTree("journal-a", "dept-1.1", [], "журнал A", true),
          ],
          "подразделение 1.1",
        ),
      ],
      "подразделение 1",
    ),
    stubTree("dept-2", null, [], "подразделение 2"),
  ];

  it("walks every child and builds root → leaf paths", () => {
    const items = flattenUnitTreePaths(forest);
    expect(items.map((item) => formatUnitPathLabel(item.path))).toEqual([
      "подразделение 1",
      "подразделение 1 -> подразделение 1.1",
      "подразделение 1 -> подразделение 1.1 -> подразделение 1.1.1",
      "подразделение 1 -> подразделение 1.1 -> журнал A",
      "подразделение 2",
    ]);
  });

  it("emits only POD-9 nodes while keeping the full ancestor path", () => {
    const items = flattenUnitTreePaths(forest, { pod9Only: true });
    expect(items.map((item) => item.unit.id)).toEqual([
      "dept-1.1.1",
      "journal-a",
    ]);
    expect(items.map((item) => formatUnitPathLabel(item.path))).toEqual([
      "подразделение 1 -> подразделение 1.1 -> подразделение 1.1.1",
      "подразделение 1 -> подразделение 1.1 -> журнал A",
    ]);
  });

  it("returns an empty list for an empty forest", () => {
    expect(flattenUnitTreePaths([])).toEqual([]);
  });
});
