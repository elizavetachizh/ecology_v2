import { describe, expect, it, vi } from "vitest";
import { VehicleSortFields } from "../../../../entities/waste/vehicles";
import { vehiclesColumns } from "./vehicles-columns";

describe("vehiclesColumns", () => {
  it("shows vehicle fields and keeps sorting inside the contract", () => {
    const columns = vehiclesColumns(vi.fn());
    const sortable = new Set<string>(VehicleSortFields);

    expect(columns.map((column) => column.id)).toEqual([
      "make",
      "model",
      "license_plate",
      "weight",
      "status",
      "beltopgas_id",
      "actions",
    ]);

    for (const column of columns) {
      const id = column.id ?? "";
      if (id === "beltopgas_id" || id === "actions") {
        expect(column.enableSorting).toBe(false);
      } else {
        expect(column.enableSorting).not.toBe(false);
        expect(sortable.has(id)).toBe(true);
      }
    }
  });
});
