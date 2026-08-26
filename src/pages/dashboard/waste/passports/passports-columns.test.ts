import { describe, expect, it, vi } from "vitest";
import { passportsColumns } from "./passports-columns";

describe("passportsColumns", () => {
  it("exposes passport fields and row actions", () => {
    const columns = passportsColumns(vi.fn(), vi.fn());
    expect(columns.map((column) => column.id)).toEqual([
      "number",
      "date",
      "unit",
      "recycling_contract",
      "transport_type",
      "status",
      "wastes",
      "actions",
    ]);
  });
});
