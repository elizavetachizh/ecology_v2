import { describe, expect, it } from "vitest";
import { toStandardWriteBody } from "./map-standard-form";

const unitId = "550e8400-e29b-41d4-a716-446655440000";
const wasteId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";

describe("toStandardWriteBody", () => {
  it("sends filled wastes without draft rows", () => {
    expect(
      toStandardWriteBody({
        start_date: "2026-01-15",
        unit_id: unitId,
        wastes: [
          {
            waste_id: wasteId,
            amount: "12.5",
            label: "Отход",
            uomLabel: "т",
          },
        ],
      }),
    ).toEqual({
      start_date: "2026-01-15",
      unit_id: unitId,
      wastes: [{ waste_id: wasteId, amount: "12.5" }],
    });
  });

  it("omits empty draft waste rows from the write body", () => {
    expect(
      toStandardWriteBody({
        start_date: "2026-01-15",
        unit_id: unitId,
        wastes: [
          { waste_id: wasteId, amount: "10", label: "Отход", uomLabel: "т" },
          { waste_id: "", amount: "", label: "", uomLabel: "" },
        ],
      }).wastes,
    ).toEqual([{ waste_id: wasteId, amount: "10" }]);
  });

  it("does not send status", () => {
    expect(
      toStandardWriteBody({
        start_date: "2026-01-15",
        unit_id: unitId,
        wastes: [],
      }),
    ).not.toHaveProperty("status");
  });
});
