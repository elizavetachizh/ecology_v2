import { describe, expect, it } from "vitest";
import { standardFormSchema } from "./standard-form.schema";

const valid = {
  start_date: "2026-01-15",
  unit_id: "550e8400-e29b-41d4-a716-446655440000",
  wastes: [],
};

describe("standardFormSchema", () => {
  it("accepts a standard without wastes", () => {
    expect(standardFormSchema.safeParse(valid).success).toBe(true);
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
        wastes: [{ waste_id: "", amount: "", label: "", uomLabel: "" }],
      }).success,
    ).toBe(true);
  });

  it("requires amount when a waste is selected", () => {
    const parsed = standardFormSchema.safeParse({
      ...valid,
      wastes: [
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
    const parsed = standardFormSchema.safeParse({
      ...valid,
      wastes: [
        { waste_id: wasteId, amount: "1", label: "A", uomLabel: "т" },
        { waste_id: wasteId, amount: "2", label: "A", uomLabel: "т" },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects amount that is not greater than 0", () => {
    expect(
      standardFormSchema.safeParse({
        ...valid,
        wastes: [
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
