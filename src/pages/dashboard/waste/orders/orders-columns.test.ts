import { describe, expect, it, vi } from "vitest";
import { ordersColumns } from "./orders-columns";

describe("ordersColumns", () => {
  it("exposes order fields and row actions", () => {
    const columns = ordersColumns(vi.fn());
    expect(columns.map((column) => column.id)).toEqual([
      "number",
      "unit",
      "start_date",
      "status",
      "actions",
    ]);
  });
});
