import type {
  NeutralizationMethod,
  Operation,
  OperationCreate,
  TransferReceiptPurpose,
  UsePurpose,
} from "../../../../entities/waste/operations";
import {
  createEmptyOperationFormValues,
  EMPTY_TYPE_SPECIFIC_VALUES,
  isInternalTransferType,
  needsTransferReceiptPurpose,
  type OperationFormValues,
} from "./operation-form.schema";

export function valuesFromOperation(operation: Operation): OperationFormValues {
  return {
    date: operation.date,
    operation_type: operation.operation_type,
    unit_id: operation.unit_id,
    waste_id: operation.waste_id,
    amount: operation.amount,
    waste_source_id: operation.waste_source_id ?? "",
    use_purpose: operation.use_purpose ?? "",
    neutralization_method: operation.neutralization_method ?? "",
    unit_side_id: operation.unit_side_id ?? "",
    transfer_receipt_purpose: operation.transfer_receipt_purpose ?? "",
    counterparty_id: operation.counterparty_id ?? "",
    document_kind: operation.passport_id
      ? "passport"
      : operation.ttn_id
        ? "ttn"
        : "",
    passport_id: operation.passport_id ?? "",
    ttn_id: operation.ttn_id ?? "",
  };
}

export function toOperationWriteBody(
  values: OperationFormValues,
): OperationCreate {
  const type = values.operation_type;

  return {
    date: values.date,
    operation_type: type,
    unit_id: values.unit_id,
    waste_id: values.waste_id,
    amount: values.amount,
    waste_source_id: type === "formed" ? values.waste_source_id : null,
    use_purpose: type === "used" ? (values.use_purpose as UsePurpose) : null,
    neutralization_method:
      type === "neutralized"
        ? (values.neutralization_method as NeutralizationMethod)
        : null,
    unit_side_id: isInternalTransferType(type) ? values.unit_side_id : null,
    transfer_receipt_purpose: needsTransferReceiptPurpose(type)
      ? (values.transfer_receipt_purpose as TransferReceiptPurpose)
      : null,
    counterparty_id: type === "received_out" ? values.counterparty_id : null,
    passport_id:
      type === "transferred_out" && values.document_kind === "passport"
        ? values.passport_id
        : null,
    ttn_id:
      type === "transferred_out" && values.document_kind === "ttn"
        ? values.ttn_id
        : null,
  };
}

export function getOperationFormValues(
  mode: "create" | "edit",
  initial?: Operation | null,
): OperationFormValues {
  if (mode === "edit" && initial) return valuesFromOperation(initial);
  return createEmptyOperationFormValues();
}

export function typeSpecificFieldNames(): (keyof typeof EMPTY_TYPE_SPECIFIC_VALUES)[] {
  return Object.keys(
    EMPTY_TYPE_SPECIFIC_VALUES,
  ) as (keyof typeof EMPTY_TYPE_SPECIFIC_VALUES)[];
}
