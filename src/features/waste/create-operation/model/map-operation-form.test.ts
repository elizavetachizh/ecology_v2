import { describe, expect, it } from "vitest";
import { toOperationWriteBody } from "./map-operation-form";
import {
  createEmptyOperationFormValues,
  EMPTY_TYPE_SPECIFIC_VALUES,
  type OperationFormValues,
} from "./operation-form.schema";

const formedValues: OperationFormValues = {
  date: "2026-03-01",
  operation_type: "formed",
  unit_id: "unit-1",
  instruction_id: "ins-1",
  waste_id: "waste-1",
  amount: "10.000000",
  ...EMPTY_TYPE_SPECIFIC_VALUES,
  waste_source_id: "ws-1",
};

const formedNulls = {
  use_purpose: null,
  neutralization_method: null,
  unit_side_id: null,
  transfer_receipt_purpose: null,
  counterparty_id: null,
  passport_id: null,
  ttn_id: null,
};

describe("map-operation-form", () => {
  it("maps formed values and nulls unused type-specific fields", () => {
    expect(toOperationWriteBody(formedValues)).toEqual({
      date: "2026-03-01",
      operation_type: "formed",
      unit_id: "unit-1",
      waste_id: "waste-1",
      amount: "10.000000",
      waste_source_id: "ws-1",
      ...formedNulls,
    });
  });

  it("sends use_purpose for used and null waste_source_id", () => {
    const body = toOperationWriteBody({
      ...formedValues,
      operation_type: "used",
      waste_source_id: "",
      use_purpose: "energy",
    });
    expect(body.waste_source_id).toBeNull();
    expect(body.use_purpose).toBe("energy");
  });

  it("maps transferred_out passport XOR and nulls ttn", () => {
    const body = toOperationWriteBody({
      ...formedValues,
      operation_type: "transferred_out",
      waste_source_id: "",
      transfer_receipt_purpose: "disposal",
      document_kind: "passport",
      passport_id: "passport-1",
    });
    expect(body.passport_id).toBe("passport-1");
    expect(body.ttn_id).toBeNull();
    expect(body.transfer_receipt_purpose).toBe("disposal");
    expect(body.counterparty_id).toBeNull();
  });

  it("starts create form with empty operation_type and instruction", () => {
    const empty = createEmptyOperationFormValues();
    expect(empty.operation_type).toBe("");
    expect(empty.instruction_id).toBe("");
  });

  it("does not send instruction_id in the write body", () => {
    expect(toOperationWriteBody(formedValues)).not.toHaveProperty(
      "instruction_id",
    );
  });
});
