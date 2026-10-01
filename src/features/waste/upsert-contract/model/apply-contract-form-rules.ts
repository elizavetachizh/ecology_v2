import type { UseFormSetValue } from "react-hook-form";
import {
  emptyContractWasteRow,
  type ContractFormValues,
} from "./contract-form.schema";
import {
  onContractTypeChange,
  onOwnershipEnabled,
  onTransferPurposeChange,
  type TransferPurposePatch,
} from "./contract-form-rules";

function assignPatch(
  setValue: UseFormSetValue<ContractFormValues>,
  patch: TransferPurposePatch,
) {
  if (patch.with_ownership_transfer !== undefined) {
    setValue("with_ownership_transfer", patch.with_ownership_transfer);
  }
  if (patch.storage_facility_type !== undefined) {
    setValue("storage_facility_type", patch.storage_facility_type);
  }
  if (patch.disposal_facility_type !== undefined) {
    setValue("disposal_facility_type", patch.disposal_facility_type);
  }
}

export function applyContractTypeChange(
  setValue: UseFormSetValue<ContractFormValues>,
  next: string,
) {
  const patch = onContractTypeChange(next);
  if (patch.kind === "transport") {
    setValue("transfer_purpose", patch.transfer_purpose);
    setValue("with_ownership_transfer", patch.with_ownership_transfer);
    setValue("storage_facility_type", patch.storage_facility_type);
    setValue("disposal_facility_type", patch.disposal_facility_type);
    setValue("wastes", [{ ...emptyContractWasteRow }]);
    return;
  }
  setValue("with_ownership_transfer", patch.with_ownership_transfer);
}

export function applyTransferPurposeChange(
  setValue: UseFormSetValue<ContractFormValues>,
  previous: string,
  next: string,
) {
  assignPatch(setValue, onTransferPurposeChange(previous, next));
}

export function applyOwnershipEnabled(
  setValue: UseFormSetValue<ContractFormValues>,
) {
  assignPatch(setValue, onOwnershipEnabled());
}
