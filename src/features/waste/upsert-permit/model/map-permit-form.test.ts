import { describe, expect, it } from "vitest";
import { makePermit } from "../../../../entities/waste/permits/model/permit.fixture";
import { toPermitFormValues, toPermitWriteBody } from "./map-permit-form";

const unitId = "550e8400-e29b-41d4-a716-446655440000";
const wasteId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
const emptyRow = { waste_id: "", amount: "", label: "", uomLabel: "" };

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
        storage_wastes: [],
      }),
    ).toEqual({
      number: "Р-001",
      start_date: "2026-01-15",
      end_date: null,
      status: "active",
      unit_id: unitId,
      burial_wastes: [{ waste_id: wasteId, amount: "12.5" }],
      storage_wastes: [],
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
          emptyRow,
        ],
        storage_wastes: [emptyRow],
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
        storage_wastes: [],
      }).status,
    ).toBe("active");
  });

  it("sends null unit_id when subdivision is empty", () => {
    expect(
      toPermitWriteBody({
        number: "Р-001",
        start_date: "2026-01-15",
        end_date: "",
        unit_id: "",
        burial_wastes: [],
        storage_wastes: [],
      }).unit_id,
    ).toBeNull();
  });

  it("sends the same waste in both limits and drops empty rows", () => {
    const row = {
      waste_id: wasteId,
      amount: "1.5",
      label: "Отход",
      uomLabel: "т",
    };
    expect(
      toPermitWriteBody({
        number: "Р-001",
        start_date: "2026-01-15",
        end_date: "",
        unit_id: unitId,
        burial_wastes: [row, emptyRow],
        storage_wastes: [{ ...row, amount: " 2 " }, emptyRow],
      }),
    ).toMatchObject({
      burial_wastes: [{ waste_id: wasteId, amount: "1.5" }],
      storage_wastes: [{ waste_id: wasteId, amount: "2" }],
    });
  });
});

describe("toPermitFormValues", () => {
  it("keeps burial and storage limits and a blank row in each list", () => {
    const values = toPermitFormValues(makePermit());
    expect(values.burial_wastes).toEqual([
      {
        waste_id: "waste-1",
        amount: "12.500000",
        label: "12345678901 — Отход тестовый",
        uomLabel: "т",
      },
      emptyRow,
    ]);
    expect(values.storage_wastes).toEqual([
      {
        waste_id: "waste-1",
        amount: "4.000000",
        label: "12345678901 — Отход тестовый",
        uomLabel: "т",
      },
      emptyRow,
    ]);
  });
});
