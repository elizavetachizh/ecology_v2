import { describe, expect, it } from "vitest";
import { operationFixture } from "../../../../entities/waste/operations/model/operation.fixture";
import {
  getOperationFormValues,
  toOperationWriteBody,
  valuesFromOperation,
} from "./map-operation-form";

describe("map-operation-form", () => {
  it("maps formed values to create body with waste_source_id", () => {
    const values = valuesFromOperation(operationFixture);
    expect(toOperationWriteBody(values)).toEqual({
      date: "2026-03-01",
      operation_type: "formed",
      unit_id: "unit-1",
      waste_id: "waste-1",
      waste_source_id: "ws-1",
      amount: "10.000000",
    });
  });

  it("sends waste_source_id null for used", () => {
    const values = valuesFromOperation({
      ...operationFixture,
      operation_type: "used",
      waste_source_id: null,
      waste_source: null,
    });
    expect(toOperationWriteBody(values).waste_source_id).toBeNull();
  });

  it("prefills edit values from an operation", () => {
    expect(getOperationFormValues("edit", operationFixture)).toEqual({
      date: "2026-03-01",
      operation_type: "formed",
      unit_id: "unit-1",
      waste_id: "waste-1",
      waste_source_id: "ws-1",
      amount: "10.000000",
    });
  });
});
