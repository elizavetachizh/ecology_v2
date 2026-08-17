import { describe, expect, it } from "vitest";
import { collectExpandableIds } from "./collect-expandable-ids";
import type { UnitTree } from "../../../../../../entities/waste/units";

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

describe("collectExpandableIds", () => {
  it("returns ancestors that have children", () => {
    const tree = [
      node("root", [node("mid", [node("leaf")]), node("other")]),
    ];
    expect(collectExpandableIds(tree)).toEqual(["root", "mid"]);
  });

  it("returns empty for a flat forest", () => {
    expect(collectExpandableIds([node("a"), node("b")])).toEqual([]);
  });
});
