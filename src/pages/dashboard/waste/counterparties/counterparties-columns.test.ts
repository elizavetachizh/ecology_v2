import { describe, expect, it, vi } from "vitest";
import { counterpartiesColumns } from "./counterparties-columns";

describe("counterpartiesColumns", () => {
  it("exposes counterparty fields and row actions", () => {
    const columns = counterpartiesColumns(vi.fn());
    expect(columns.map((column) => column.id)).toEqual([
      "name",
      "full_name",
      "unp",
      "kind",
      "status",
      "actions",
    ]);
  });
});
