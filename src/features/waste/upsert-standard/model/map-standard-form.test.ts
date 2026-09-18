import { describe, expect, it } from "vitest";
import { toStandardFormValues, toStandardWriteBody } from "./map-standard-form";
import { makeStandard } from "../../../../entities/waste/standards/model/standard.fixture";

const unitId = "550e8400-e29b-41d4-a716-446655440000";
const wasteId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";

describe("toStandardWriteBody", () => {
  it("sends units with filled wastes without draft rows", () => {
    expect(
      toStandardWriteBody({
        start_date: "2026-01-15",
        units: [
          {
            unit_id: unitId,
            unit_label: "Цех №1 (Ц1)",
            wastes: [
              {
                waste_id: wasteId,
                amount: "12.5",
                label: "Отход",
                uomLabel: "т",
              },
            ],
          },
        ],
      }),
    ).toEqual({
      start_date: "2026-01-15",
      units: [
        {
          unit_id: unitId,
          wastes: [{ waste_id: wasteId, amount: "12.5" }],
        },
      ],
    });
  });

  it("omits empty draft waste rows from the write body", () => {
    expect(
      toStandardWriteBody({
        start_date: "2026-01-15",
        units: [
          {
            unit_id: unitId,
            unit_label: "Цех",
            wastes: [
              {
                waste_id: wasteId,
                amount: "10",
                label: "Отход",
                uomLabel: "т",
              },
              { waste_id: "", amount: "", label: "", uomLabel: "" },
            ],
          },
        ],
      }).units,
    ).toEqual([
      { unit_id: unitId, wastes: [{ waste_id: wasteId, amount: "10" }] },
    ]);
  });

  it("does not send status", () => {
    expect(
      toStandardWriteBody({
        start_date: "2026-01-15",
        units: [],
      }),
    ).not.toHaveProperty("status");
  });

  it("sends empty units when none added", () => {
    expect(
      toStandardWriteBody({
        start_date: "2026-01-15",
        units: [],
      }).units,
    ).toEqual([]);
  });
});

describe("toStandardFormValues", () => {
  it("maps nested units and keeps a draft waste row", () => {
    const values = toStandardFormValues(makeStandard());
    expect(values.start_date).toBe("2026-01-15");
    expect(values.units).toHaveLength(1);
    expect(values.units[0]?.unit_id).toBe("unit-1");
    expect(values.units[0]?.unit_label).toBe("Цех №1 (Ц1)");
    expect(values.units[0]?.wastes).toHaveLength(2);
    expect(values.units[0]?.wastes[1]?.waste_id).toBe("");
  });
});
