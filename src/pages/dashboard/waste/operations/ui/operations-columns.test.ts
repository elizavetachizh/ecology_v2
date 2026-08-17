import { describe, expect, it, vi } from "vitest";
import { operationsColumns } from "./operations-columns";

describe("operationsColumns", () => {
  it("exposes Operation fields and row actions, without mock-only columns", () => {
    const columns = operationsColumns(vi.fn(), vi.fn(), vi.fn());
    expect(columns.map((column) => column.id)).toEqual([
      "date",
      "unit",
      "waste",
      "operation_type",
      "amount",
      "waste_source",
      "balance",
      "actions",
    ]);
  });
});
