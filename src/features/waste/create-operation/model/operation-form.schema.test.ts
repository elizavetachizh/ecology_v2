import { describe, expect, it } from "vitest";
import { operationFormSchema } from "./operation-form.schema";

const UNIT_ID = "11111111-1111-4111-8111-111111111111";
const WASTE_ID = "22222222-2222-4222-8222-222222222222";
const SOURCE_ID = "33333333-3333-4333-8333-333333333333";
const SIDE_ID = "44444444-4444-4444-8444-444444444444";
const COUNTERPARTY_ID = "55555555-5555-4555-8555-555555555555";
const PASSPORT_ID = "66666666-6666-4666-8666-666666666666";
const TTN_ID = "77777777-7777-4777-8777-777777777777";

const emptySpecific = {
  waste_source_id: "",
  use_purpose: "",
  neutralization_method: "",
  unit_side_id: "",
  transfer_receipt_purpose: "",
  counterparty_id: "",
  document_kind: "" as const,
  passport_id: "",
  ttn_id: "",
};

const base = {
  date: "2026-03-01",
  unit_id: UNIT_ID,
  waste_id: WASTE_ID,
  amount: "10.5",
  ...emptySpecific,
};

describe("operationFormSchema", () => {
  it("accepts formed with waste source", () => {
    const values = {
      ...base,
      operation_type: "formed" as const,
      waste_source_id: SOURCE_ID,
    };
    expect(operationFormSchema.parse(values)).toEqual(values);
  });

  it("requires waste_source_id for formed", () => {
    const result = operationFormSchema.safeParse({
      ...base,
      operation_type: "formed",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["waste_source_id"]);
    }
  });

  it("requires use_purpose for used", () => {
    const missing = operationFormSchema.safeParse({
      ...base,
      operation_type: "used",
    });
    expect(missing.success).toBe(false);

    const values = {
      ...base,
      operation_type: "used" as const,
      use_purpose: "energy",
    };
    expect(operationFormSchema.parse(values)).toEqual(values);
  });

  it("requires neutralization_method for neutralized", () => {
    const values = {
      ...base,
      operation_type: "neutralized" as const,
      neutralization_method: "thermal",
    };
    expect(operationFormSchema.parse(values)).toEqual(values);
  });

  it("requires unit_side_id ≠ unit_id and purpose for internal transfer", () => {
    const sameUnit = operationFormSchema.safeParse({
      ...base,
      operation_type: "transferred_in",
      unit_side_id: UNIT_ID,
      transfer_receipt_purpose: "use",
    });
    expect(sameUnit.success).toBe(false);

    const values = {
      ...base,
      operation_type: "received_in" as const,
      unit_side_id: SIDE_ID,
      transfer_receipt_purpose: "storage",
    };
    expect(operationFormSchema.parse(values)).toEqual(values);
  });

  it("requires counterparty and purpose for received_out", () => {
    const values = {
      ...base,
      operation_type: "received_out" as const,
      transfer_receipt_purpose: "use",
      counterparty_id: COUNTERPARTY_ID,
    };
    expect(operationFormSchema.parse(values)).toEqual(values);
  });

  it("requires exactly one of passport or ttn for transferred_out", () => {
    const missingKind = operationFormSchema.safeParse({
      ...base,
      operation_type: "transferred_out",
      transfer_receipt_purpose: "disposal",
    });
    expect(missingKind.success).toBe(false);

    const passport = {
      ...base,
      operation_type: "transferred_out" as const,
      transfer_receipt_purpose: "disposal" as const,
      document_kind: "passport" as const,
      passport_id: PASSPORT_ID,
    };
    expect(operationFormSchema.parse(passport)).toEqual(passport);

    const ttn = {
      ...base,
      operation_type: "transferred_out" as const,
      transfer_receipt_purpose: "disposal" as const,
      document_kind: "ttn" as const,
      ttn_id: TTN_ID,
    };
    expect(operationFormSchema.parse(ttn)).toEqual(ttn);
  });

  it("rejects amount 0 and non-decimal strings", () => {
    expect(
      operationFormSchema.safeParse({
        ...base,
        operation_type: "formed",
        waste_source_id: SOURCE_ID,
        amount: "0",
      }).success,
    ).toBe(false);
    expect(
      operationFormSchema.safeParse({
        ...base,
        operation_type: "formed",
        waste_source_id: SOURCE_ID,
        amount: "1.1234567",
      }).success,
    ).toBe(false);
  });

  it("requires YYYY-MM-DD date and uuid unit/waste", () => {
    expect(
      operationFormSchema.safeParse({
        ...base,
        operation_type: "formed",
        waste_source_id: SOURCE_ID,
        date: "01.03.2026",
      }).success,
    ).toBe(false);
    expect(
      operationFormSchema.safeParse({
        ...base,
        operation_type: "formed",
        waste_source_id: SOURCE_ID,
        unit_id: "",
      }).success,
    ).toBe(false);
  });
});
