import { describe, expect, it } from "vitest";
import { ordersQueryKeys } from "./orders-query-keys";

describe("ordersQueryKeys", () => {
  it("builds hierarchical list, detail, state and responsible keys", () => {
    const params = {
      limit: 50,
      offset: 0,
      sort: "date" as const,
      order: "desc" as const,
    };

    expect(ordersQueryKeys.all).toEqual(["mdm", "orders"]);
    expect(ordersQueryKeys.lists()).toEqual(["mdm", "orders", "list"]);
    expect(ordersQueryKeys.list("tenant-1", params)).toEqual([
      "mdm",
      "orders",
      "list",
      "tenant-1",
      params,
    ]);
    expect(ordersQueryKeys.details()).toEqual(["mdm", "orders", "detail"]);
    expect(ordersQueryKeys.detail("tenant-1", "order-1")).toEqual([
      "mdm",
      "orders",
      "detail",
      "tenant-1",
      "order-1",
    ]);
    expect(ordersQueryKeys.stateList("tenant-1", "order-1")).toEqual([
      "mdm",
      "orders",
      "states",
      "tenant-1",
      "order-1",
    ]);
    expect(ordersQueryKeys.state("tenant-1", "order-1", "state-1")).toEqual([
      "mdm",
      "orders",
      "states",
      "tenant-1",
      "order-1",
      "state-1",
    ]);
    expect(
      ordersQueryKeys.unitResponsibleOn("tenant-1", {
        unitId: "unit-1",
        on: "2024-06-01",
      }),
    ).toEqual([
      "mdm",
      "orders",
      "unit-responsible",
      "tenant-1",
      "unit-1",
      "2024-06-01",
    ]);
    expect(
      ordersQueryKeys.unitResponsibleOn("tenant-1", { unitId: "unit-1" }),
    ).toEqual([
      "mdm",
      "orders",
      "unit-responsible",
      "tenant-1",
      "unit-1",
      null,
    ]);
  });
});
