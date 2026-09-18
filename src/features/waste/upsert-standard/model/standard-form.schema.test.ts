import { describe, expect, it } from "vitest";
import { standardFormSchema } from "./standard-form.schema";

const unitId = "550e8400-e29b-41d4-a716-446655440000";
const wasteId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
const otherWasteId = "7ba7b810-9dad-41d1-80b4-00c04fd430c8";

const valid = {
  start_date: "2026-01-15",
  units: [] as {
    unit_id: string;
    unit_label: string;
    wastes: {
      waste_id: string;
      amount: string;
      label: string;
      uomLabel: string;
    }[];
  }[],
};

describe("standardFormSchema", () => {
  it("accepts a standard without units", () => {
    expect(standardFormSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a unit without wastes", () => {
    expect(
      standardFormSchema.safeParse({
        ...valid,
        units: [{ unit_id: unitId, unit_label: "Цех", wastes: [] }],
      }).success,
    ).toBe(true);
  });

  it("rejects invalid start_date", () => {
    const parsed = standardFormSchema.safeParse({
      ...valid,
      start_date: "15.01.2026",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts empty draft waste rows", () => {
    expect(
      standardFormSchema.safeParse({
        ...valid,
        units: [
          {
            unit_id: unitId,
            unit_label: "Цех",
            wastes: [{ waste_id: "", amount: "", label: "", uomLabel: "" }],
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("requires amount when a waste is selected", () => {
    const parsed = standardFormSchema.safeParse({
      ...valid,
      units: [
        {
          unit_id: unitId,
          unit_label: "Цех",
          wastes: [
            {
              waste_id: wasteId,
              amount: "",
              label: "A",
              uomLabel: "т",
            },
          ],
        },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate wastes inside one unit", () => {
    const parsed = standardFormSchema.safeParse({
      ...valid,
      units: [
        {
          unit_id: unitId,
          unit_label: "Цех",
          wastes: [
            { waste_id: wasteId, amount: "1", label: "A", uomLabel: "т" },
            { waste_id: wasteId, amount: "2", label: "A", uomLabel: "т" },
          ],
        },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("allows the same waste in different units", () => {
    const otherUnitId = "650e8400-e29b-41d4-a716-446655440000";
    expect(
      standardFormSchema.safeParse({
        ...valid,
        units: [
          {
            unit_id: unitId,
            unit_label: "Цех",
            wastes: [
              { waste_id: wasteId, amount: "1", label: "A", uomLabel: "т" },
            ],
          },
          {
            unit_id: otherUnitId,
            unit_label: "Склад",
            wastes: [
              { waste_id: wasteId, amount: "2", label: "A", uomLabel: "т" },
              {
                waste_id: otherWasteId,
                amount: "3",
                label: "B",
                uomLabel: "т",
              },
            ],
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects duplicate units", () => {
    const parsed = standardFormSchema.safeParse({
      ...valid,
      units: [
        { unit_id: unitId, unit_label: "Цех", wastes: [] },
        { unit_id: unitId, unit_label: "Цех", wastes: [] },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects amount that is not greater than 0", () => {
    expect(
      standardFormSchema.safeParse({
        ...valid,
        units: [
          {
            unit_id: unitId,
            unit_label: "Цех",
            wastes: [
              {
                waste_id: wasteId,
                amount: "0",
                label: "A",
                uomLabel: "т",
              },
            ],
          },
        ],
      }).success,
    ).toBe(false);
  });
});
