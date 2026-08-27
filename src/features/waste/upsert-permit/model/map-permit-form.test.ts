import { describe, expect, it } from "vitest";
import { toPermitWriteBody } from "./map-permit-form";

const unitId = "550e8400-e29b-41d4-a716-446655440000";
const wasteId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";

describe("toPermitWriteBody", () => {
  it("sends empty end_date as null and filled burial wastes", () => {
    expect(
      toPermitWriteBody({
        number: " Р-001 ",
        start_date: "2026-01-15",
        end_date: "",
        unit_id: unitId,
        burial_wastes: [
          {
            waste_id: wasteId,
            amount: "12.5",
            label: "Отход",
            uomLabel: "т",
          },
        ],
      }),
    ).toEqual({
      number: "Р-001",
      start_date: "2026-01-15",
      end_date: null,
      status: "active",
      unit_id: unitId,
      burial_wastes: [{ waste_id: wasteId, amount: "12.5" }],
    });
  });

  it("omits empty draft burial rows from the write body", () => {
    expect(
      toPermitWriteBody({
        number: "Р-001",
        start_date: "2026-01-15",
        end_date: "",
        unit_id: unitId,
        burial_wastes: [
          { waste_id: wasteId, amount: "10", label: "Отход", uomLabel: "т" },
          { waste_id: "", amount: "", label: "", uomLabel: "" },
        ],
      }).burial_wastes,
    ).toEqual([{ waste_id: wasteId, amount: "10" }]);
  });

  it("always sends status active", () => {
    expect(
      toPermitWriteBody({
        number: "Р-001",
        start_date: "2026-01-15",
        end_date: "",
        unit_id: unitId,
        burial_wastes: [],
      }).status,
    ).toBe("active");
  });
});
