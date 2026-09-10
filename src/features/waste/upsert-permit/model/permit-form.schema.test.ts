import { describe, expect, it } from "vitest";
import {
  nextSyncedPermitEndDate,
  permitEndDateFromStart,
  permitFormDefaultValues,
  permitFormSchema,
} from "./permit-form.schema";

const valid = {
  number: "Р-001",
  start_date: "2026-01-15",
  end_date: "2026-12-31",
  status: "active" as const,
  unit_id: "550e8400-e29b-41d4-a716-446655440000",
  burial_wastes: [],
};

describe("permitFormDefaultValues", () => {
  it("sets end_date five years after start_date", () => {
    expect(permitFormDefaultValues.end_date).toBe(
      permitEndDateFromStart(permitFormDefaultValues.start_date),
    );
  });
});

describe("nextSyncedPermitEndDate", () => {
  it("moves end_date with start_date while it still equals start+5 years", () => {
    expect(
      nextSyncedPermitEndDate({
        previousStart: "2026-09-10",
        nextStart: "2027-01-01",
        currentEnd: permitEndDateFromStart("2026-09-10"),
      }),
    ).toBe(permitEndDateFromStart("2027-01-01"));
  });

  it("keeps a user-edited end_date", () => {
    expect(
      nextSyncedPermitEndDate({
        previousStart: "2026-09-10",
        nextStart: "2027-01-01",
        currentEnd: "2028-06-01",
      }),
    ).toBeNull();
  });

  it("fills an empty end_date from the new start", () => {
    expect(
      nextSyncedPermitEndDate({
        previousStart: "2026-09-10",
        nextStart: "2026-10-01",
        currentEnd: "",
      }),
    ).toBe(permitEndDateFromStart("2026-10-01"));
  });
});

describe("permitFormSchema", () => {
  it("accepts a permit without burial wastes", () => {
    expect(permitFormSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts missing unit_id", () => {
    expect(permitFormSchema.safeParse({ ...valid, unit_id: "" }).success).toBe(
      true,
    );
    expect(
      permitFormSchema.safeParse({ ...valid, unit_id: null }).success,
    ).toBe(true);
  });

  it("rejects end_date before start_date", () => {
    const parsed = permitFormSchema.safeParse({
      ...valid,
      end_date: "2026-01-01",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts empty draft burial rows", () => {
    expect(
      permitFormSchema.safeParse({
        ...valid,
        burial_wastes: [{ waste_id: "", amount: "", label: "", uomLabel: "" }],
      }).success,
    ).toBe(true);
  });

  it("requires amount when a waste is selected", () => {
    const parsed = permitFormSchema.safeParse({
      ...valid,
      burial_wastes: [
        {
          waste_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
          amount: "",
          label: "A",
          uomLabel: "т",
        },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate wastes", () => {
    const wasteId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
    const parsed = permitFormSchema.safeParse({
      ...valid,
      burial_wastes: [
        { waste_id: wasteId, amount: "1", label: "A", uomLabel: "т" },
        { waste_id: wasteId, amount: "2", label: "A", uomLabel: "т" },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects amount that is not greater than 0", () => {
    expect(
      permitFormSchema.safeParse({
        ...valid,
        burial_wastes: [
          {
            waste_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
            amount: "0",
            label: "A",
            uomLabel: "т",
          },
        ],
      }).success,
    ).toBe(false);
  });
});
