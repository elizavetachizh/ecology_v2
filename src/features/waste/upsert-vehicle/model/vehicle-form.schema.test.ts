import { describe, expect, it } from "vitest";
import { vehicleFormSchema } from "./vehicle-form.schema";

const valid = {
  make: "МАЗ",
  model: "5551",
  license_plate: "1234 AB-7",
  weight: "",
  status: "active" as const,
  beltopgas_id: "",
};

describe("vehicleFormSchema", () => {
  it("accepts empty weight and beltopgas id", () => {
    const parsed = vehicleFormSchema.safeParse({
      ...valid,
      weight: "   ",
      beltopgas_id: "  ",
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.weight).toBe("");
    expect(parsed.data.beltopgas_id).toBe("");
  });

  it("accepts a positive weight and any integer beltopgas id", () => {
    expect(
      vehicleFormSchema.safeParse({
        ...valid,
        weight: "12000",
        beltopgas_id: "0",
      }).success,
    ).toBe(true);
    expect(
      vehicleFormSchema.safeParse({
        ...valid,
        beltopgas_id: "-15",
      }).success,
    ).toBe(true);
  });

  it("rejects blank make, model and license plate and text longer than 255", () => {
    expect(vehicleFormSchema.safeParse({ ...valid, make: "   " }).success).toBe(
      false,
    );
    expect(vehicleFormSchema.safeParse({ ...valid, model: "" }).success).toBe(
      false,
    );
    expect(
      vehicleFormSchema.safeParse({ ...valid, license_plate: " " }).success,
    ).toBe(false);
    expect(
      vehicleFormSchema.safeParse({ ...valid, make: "а".repeat(255) }).success,
    ).toBe(true);
    expect(
      vehicleFormSchema.safeParse({ ...valid, model: "а".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects weight that is not a positive integer", () => {
    expect(vehicleFormSchema.safeParse({ ...valid, weight: "0" }).success).toBe(
      false,
    );
    expect(
      vehicleFormSchema.safeParse({ ...valid, weight: "-1" }).success,
    ).toBe(false);
    expect(
      vehicleFormSchema.safeParse({ ...valid, weight: "1.5" }).success,
    ).toBe(false);
  });

  it("rejects a non-integer beltopgas id", () => {
    expect(
      vehicleFormSchema.safeParse({ ...valid, beltopgas_id: "1.5" }).success,
    ).toBe(false);
    expect(
      vehicleFormSchema.safeParse({ ...valid, beltopgas_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(
      vehicleFormSchema.safeParse({ ...valid, status: "draft" }).success,
    ).toBe(false);
  });
});
