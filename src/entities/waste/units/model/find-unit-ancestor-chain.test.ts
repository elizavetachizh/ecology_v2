import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  findCachedAncestorChain,
  findPathInTrees,
  seedUnitDetails,
  toUnit,
} from "./find-unit-ancestor-chain";
import { unitsQueryKeys } from "./unit-query-keys";
import type { Unit, UnitTree } from "./units.types";

function stubUnit(id: string, parentId: string | null, name = id): Unit {
  return {
    id,
    tenant_id: "t1",
    name,
    short_name: null,
    parent_id: parentId,
    is_pod9: false,
    region: null,
    district: null,
    created_at: "",
    updated_at: "",
    created_by: { id: "u", username: "u", email: null, first_name: null, last_name: null },
    updated_by: { id: "u", username: "u", email: null, first_name: null, last_name: null },
  };
}

function stubTree(
  id: string,
  parentId: string | null,
  children: UnitTree[] = [],
): UnitTree {
  return { ...stubUnit(id, parentId), children };
}

describe("findPathInTrees", () => {
  const forest = [
    stubTree("root", null, [
      stubTree("mid", "root", [stubTree("leaf", "mid")]),
      stubTree("other", "root"),
    ]),
  ];

  it("returns root → … → unit", () => {
    const path = findPathInTrees(forest, "leaf");
    expect(path?.map((item) => item.id)).toEqual(["root", "mid", "leaf"]);
    expect(path?.every((item) => !("children" in item))).toBe(true);
  });

  it("returns null when unit is not in the forest", () => {
    expect(findPathInTrees(forest, "missing")).toBeNull();
  });
});

describe("findCachedAncestorChain", () => {
  it("reads the tenant tree cache and prefers the live unit", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      unitsQueryKeys.tree("t1", { sort: "name", order: "asc" }),
      [
        stubTree("root", null, [
          stubTree("mid", "root", [stubTree("leaf", "mid")]),
        ]),
      ],
    );

    const live = stubUnit("leaf", "mid", "Leaf renamed");
    const path = findCachedAncestorChain(queryClient, "t1", live);
    expect(path?.map((item) => item.id)).toEqual(["root", "mid", "leaf"]);
    expect(path?.at(-1)?.name).toBe("Leaf renamed");
  });
});

describe("seedUnitDetails", () => {
  it("does not overwrite an existing detail", () => {
    const queryClient = new QueryClient();
    const existing = stubUnit("root", null, "cached");
    queryClient.setQueryData(unitsQueryKeys.detail("t1", "root"), existing);

    seedUnitDetails(queryClient, "t1", [stubUnit("root", null, "from-tree")]);
    expect(
      queryClient.getQueryData<Unit>(unitsQueryKeys.detail("t1", "root"))?.name,
    ).toBe("cached");
  });
});

describe("toUnit", () => {
  it("strips children", () => {
    const unit = toUnit(stubTree("root", null, [stubTree("child", "root")]));
    expect(unit).not.toHaveProperty("children");
    expect(unit.id).toBe("root");
  });
});
