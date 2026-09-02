import { describe, expect, it } from "vitest";
import { ordersQueryKeys } from "./orders-query-keys";

describe("ordersQueryKeys", () => {
  it("builds hierarchical list and detail keys", () => {
    const params = {
      limit: 50,
      offset: 0,
      sort: "start_date" as const,
      order: "desc" as const,
      status: "active" as const,
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
  });
});
