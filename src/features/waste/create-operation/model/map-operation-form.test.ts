import { describe, expect, it } from "vitest";
import { operationFixture } from "../../../../entities/waste/operations/model/operation.fixture";
import {
  getOperationFormValues,
  toOperationWriteBody,
  valuesFromOperation,
} from "./map-operation-form";
import { EMPTY_TYPE_SPECIFIC_VALUES } from "./operation-form.schema";

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
    const values = valuesFromOperation(operationFixture);
    expect(toOperationWriteBody(values)).toEqual({
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
    const values = valuesFromOperation({
      ...operationFixture,
      operation_type: "used",
      waste_source_id: null,
      waste_source: null,
      use_purpose: "energy",
    });
    const body = toOperationWriteBody(values);
    expect(body.waste_source_id).toBeNull();
    expect(body.use_purpose).toBe("energy");
  });

  it("maps transferred_out passport XOR and nulls ttn", () => {
    const values = valuesFromOperation({
      ...operationFixture,
      operation_type: "transferred_out",
      waste_source_id: null,
      waste_source: null,
      transfer_receipt_purpose: "disposal",
      passport_id: "passport-1",
      ttn_id: null,
    });
    const body = toOperationWriteBody(values);
    expect(body.passport_id).toBe("passport-1");
    expect(body.ttn_id).toBeNull();
    expect(body.transfer_receipt_purpose).toBe("disposal");
    expect(body.counterparty_id).toBeNull();
  });

  it("starts create form with empty operation_type", () => {
    expect(getOperationFormValues("create").operation_type).toBe("");
  });

  it("prefills edit values including document_kind from passport", () => {
    expect(getOperationFormValues("edit", operationFixture)).toEqual({
      date: "2026-03-01",
      operation_type: "formed",
      unit_id: "unit-1",
      waste_id: "waste-1",
      amount: "10.000000",
      ...EMPTY_TYPE_SPECIFIC_VALUES,
      waste_source_id: "ws-1",
    });
  });
});
