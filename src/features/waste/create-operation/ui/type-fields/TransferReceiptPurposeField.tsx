import {
  TRANSFER_RECEIPT_PURPOSE_LABEL,
  TransferReceiptPurposeValues,
} from "../../../../../entities/waste/operations";
import { EnumSelectField } from "./EnumSelectField";

type TransferReceiptPurposeFieldProps = {
  pending: boolean;
};

export function TransferReceiptPurposeField({
  pending,
}: TransferReceiptPurposeFieldProps) {
  return (
    <EnumSelectField
      name="transfer_receipt_purpose"
      label="Цель передачи или поступления"
      values={TransferReceiptPurposeValues}
      labels={TRANSFER_RECEIPT_PURPOSE_LABEL}
      placeholder="Выберите цель"
      pending={pending}
    />
  );
}
