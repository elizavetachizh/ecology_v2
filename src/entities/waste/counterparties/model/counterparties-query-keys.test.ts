import { describe, expect, it } from "vitest";
import { counterpartiesQueryKeys } from "./counterparties-query-keys";

describe("counterpartiesQueryKeys", () => {
  it("builds hierarchical list and detail keys", () => {
    const params = {
      limit: 50,
      offset: 0,
      sort: "name" as const,
      order: "asc" as const,
      is_active: true,
    };

    expect(counterpartiesQueryKeys.all).toEqual(["mdm", "counterparties"]);
    expect(counterpartiesQueryKeys.lists()).toEqual([
      "mdm",
      "counterparties",
      "list",
    ]);
    expect(counterpartiesQueryKeys.list("tenant-1", params)).toEqual([
      "mdm",
      "counterparties",
      "list",
      "tenant-1",
      params,
    ]);
    expect(counterpartiesQueryKeys.details()).toEqual([
      "mdm",
      "counterparties",
      "detail",
    ]);
    expect(counterpartiesQueryKeys.detail("tenant-1", "cp-1")).toEqual([
      "mdm",
      "counterparties",
      "detail",
      "tenant-1",
      "cp-1",
    ]);
  });
});
