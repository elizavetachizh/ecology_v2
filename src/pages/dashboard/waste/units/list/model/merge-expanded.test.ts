import { describe, expect, it } from "vitest";
import type { UnitTree } from "../../../../../../entities/waste/units";
import { collapsedFromExpanded, expandedFromCollapsed } from "./merge-expanded";

function node(id: string, children: UnitTree[] = []): UnitTree {
  return {
    id,
    tenant_id: "t",
    name: id,
    short_name: null,
    parent_id: null,
    is_pod9: false,
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
    children,
  };
}

const tree = [node("root", [node("mid", [node("leaf")]), node("other")])];

describe("expandedFromCollapsed", () => {
  it("opens every node with children when nothing is collapsed", () => {
    expect(expandedFromCollapsed(tree, {})).toEqual({
      root: true,
      mid: true,
    });
  });

  it("keeps user-collapsed nodes closed and new parents open", () => {
    expect(expandedFromCollapsed(tree, { mid: true })).toEqual({
      root: true,
    });
  });
});

describe("collapsedFromExpanded", () => {
  it("treats expanded=true as nothing collapsed", () => {
    expect(collapsedFromExpanded(tree, true)).toEqual({});
  });

  it("records expandable ids missing from the table state", () => {
    expect(collapsedFromExpanded(tree, { root: true })).toEqual({
      mid: true,
    });
  });
});
