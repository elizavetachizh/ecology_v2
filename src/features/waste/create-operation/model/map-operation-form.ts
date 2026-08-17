import type {
  Operation,
  OperationCreate,
} from "../../../../entities/waste/operations";
import {
  createEmptyOperationFormValues,
  type OperationFormValues,
} from "./operation-form.schema";

export function valuesFromOperation(operation: Operation): OperationFormValues {
  return {
    date: operation.date,
    operation_type: operation.operation_type,
    unit_id: operation.unit_id,
    waste_id: operation.waste_id,
    waste_source_id: operation.waste_source_id ?? "",
    amount: operation.amount,
  };
}

export function toOperationWriteBody(
  values: OperationFormValues,
): OperationCreate {
  return {
    date: values.date,
    operation_type: values.operation_type,
    unit_id: values.unit_id,
    waste_id: values.waste_id,
    waste_source_id:
      values.operation_type === "formed" ? values.waste_source_id : null,
    amount: values.amount,
  };
}

export function getOperationFormValues(
  mode: "create" | "edit",
  initial?: Operation | null,
): OperationFormValues {
  if (mode === "edit" && initial) return valuesFromOperation(initial);
  return createEmptyOperationFormValues();
}
