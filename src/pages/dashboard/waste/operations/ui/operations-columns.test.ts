import { describe, expect, it, vi } from "vitest";
import { operationsColumns } from "./operations-columns";

const actions = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onApprove: vi.fn(),
  onReject: vi.fn(),
};

describe("operationsColumns", () => {
  it("exposes Operation fields, status and row actions", () => {
    const columns = operationsColumns(actions);
    expect(columns.map((column) => column.id)).toEqual([
      "date",
      "unit",
      "waste",
      "operation_type",
      "status",
      "amount",
      "waste_source",
      "balance",
      "actions",
    ]);
  });
});
