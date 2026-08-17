import { describe, expect, it } from "vitest";
import { operationFormSchema } from "./operation-form.schema";

const UNIT_ID = "11111111-1111-4111-8111-111111111111";
const WASTE_ID = "22222222-2222-4222-8222-222222222222";
const SOURCE_ID = "33333333-3333-4333-8333-333333333333";

const validFormed = {
  date: "2026-03-01",
  operation_type: "formed" as const,
  unit_id: UNIT_ID,
  waste_id: WASTE_ID,
  waste_source_id: SOURCE_ID,
  amount: "10.5",
};

describe("operationFormSchema", () => {
  it("accepts a formed operation with a waste source and amount > 0", () => {
    expect(operationFormSchema.parse(validFormed)).toEqual(validFormed);
  });

  it("accepts a used operation when waste_source_id is empty", () => {
    const values = {
      ...validFormed,
      operation_type: "used" as const,
      waste_source_id: "",
    };
    expect(operationFormSchema.parse(values)).toEqual(values);
  });

  it("requires waste_source_id for formed", () => {
    const result = operationFormSchema.safeParse({
      ...validFormed,
      waste_source_id: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["waste_source_id"]);
    }
  });

  it("rejects waste_source_id for used", () => {
    const result = operationFormSchema.safeParse({
      ...validFormed,
      operation_type: "used",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["waste_source_id"]);
    }
  });

  it("rejects amount 0 and non-decimal strings", () => {
    expect(
      operationFormSchema.safeParse({ ...validFormed, amount: "0" }).success,
    ).toBe(false);
    expect(
      operationFormSchema.safeParse({ ...validFormed, amount: "-1" }).success,
    ).toBe(false);
    expect(
      operationFormSchema.safeParse({ ...validFormed, amount: "1.1234567" })
        .success,
    ).toBe(false);
  });

  it("requires YYYY-MM-DD date and uuid unit/waste", () => {
    expect(
      operationFormSchema.safeParse({ ...validFormed, date: "01.03.2026" })
        .success,
    ).toBe(false);
    expect(
      operationFormSchema.safeParse({ ...validFormed, unit_id: "" }).success,
    ).toBe(false);
    expect(
      operationFormSchema.safeParse({ ...validFormed, waste_id: "not-uuid" })
        .success,
    ).toBe(false);
  });
});
