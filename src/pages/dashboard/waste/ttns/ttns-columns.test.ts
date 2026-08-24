import { describe, expect, it, vi } from "vitest";
import { ttnsColumns } from "./ttns-columns";

describe("ttnsColumns", () => {
  it("exposes ttn fields and row actions", () => {
    const columns = ttnsColumns(vi.fn());
    expect(columns.map((column) => column.id)).toEqual([
      "number",
      "date",
      "unit",
      "recycling_contract",
      "status",
      "actions",
    ]);
  });
});
