import { describe, expect, it } from "vitest";
import { operationsQueryKeys } from "./operations-query-keys";

describe("operationsQueryKeys", () => {
  it("builds hierarchical list, detail, balances and current keys", () => {
    const listParams = {
      limit: 50,
      offset: 0,
      operation_type: "formed" as const,
    };
    const balanceParams = { limit: 50, offset: 0, unit_id: "unit-1" };

    expect(operationsQueryKeys.all).toEqual(["operations"]);
    expect(operationsQueryKeys.lists()).toEqual(["operations", "list"]);
    expect(operationsQueryKeys.list("tenant-1", listParams)).toEqual([
      "operations",
      "list",
      "tenant-1",
      listParams,
    ]);
    expect(operationsQueryKeys.details()).toEqual(["operations", "detail"]);
    expect(operationsQueryKeys.detail("tenant-1", "op-1")).toEqual([
      "operations",
      "detail",
      "tenant-1",
      "op-1",
    ]);
    expect(operationsQueryKeys.balances()).toEqual(["operations", "balances"]);
    expect(operationsQueryKeys.balanceList("tenant-1", balanceParams)).toEqual([
      "operations",
      "balances",
      "tenant-1",
      balanceParams,
    ]);
    expect(operationsQueryKeys.current()).toEqual(["operations", "current"]);
    expect(
      operationsQueryKeys.currentBalance("tenant-1", "unit-1", "waste-1"),
    ).toEqual(["operations", "current", "tenant-1", "unit-1", "waste-1"]);
  });
});
