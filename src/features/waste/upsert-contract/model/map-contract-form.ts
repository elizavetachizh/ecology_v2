import type {
  Contract,
  ContractCreate,
  ContractUpdate,
} from "../../../../entities/waste/contracts";
import { wasteLabel } from "../../../../entities/waste/wastes";
import {
  emptyContractWasteRow,
  type ContractFormValues,
} from "./contract-form.schema";
import { facilityKind, normalizeOwnership } from "./contract-form-rules";

function emptyToNull(value: string): string | null {
  return value.trim() || null;
}

export function toContractWriteBody(
  values: ContractFormValues,
): ContractCreate {
  const isRecycling = values.contract_type === "recycling";
  const kind = isRecycling
    ? facilityKind(values.transfer_purpose, values.with_ownership_transfer)
    : null;
  return {
    number: values.number.trim(),
    start_date: values.start_date,
    end_date: emptyToNull(values.end_date),
    contract_type: values.contract_type,
    status: values.status,
    counterparty_id: values.counterparty_id,
    counterparty_address: emptyToNull(values.counterparty_address),
    counterparty_contact: emptyToNull(values.counterparty_contact),
    amount: emptyToNull(values.amount),
    with_ownership_transfer: isRecycling
      ? normalizeOwnership(
          values.contract_type,
          values.transfer_purpose,
          values.with_ownership_transfer,
        )
      : false,
    transfer_purpose: isRecycling ? values.transfer_purpose || null : null,
    storage_facility_type:
      kind === "storage" && values.storage_facility_type
        ? values.storage_facility_type
        : null,
    disposal_facility_type:
      kind === "disposal" && values.disposal_facility_type
        ? values.disposal_facility_type
        : null,
    wastes: isRecycling
      ? values.wastes
          .filter((item) => item.waste_id)
          .map((item) => ({
            waste_id: item.waste_id,
            cost_per_unit: emptyToNull(item.cost_per_unit),
          }))
      : [],
  };
}

/** PATCH всегда шлёт wastes — полная замена перечня. */
export function toContractUpdateBody(
  values: ContractFormValues,
): ContractUpdate {
  return toContractWriteBody(values);
}

export function toContractFormValues(contract: Contract): ContractFormValues {
  return {
    number: contract.number,
    start_date: contract.start_date,
    end_date: contract.end_date ?? "",
    contract_type: contract.contract_type,
    status: contract.status,
    counterparty_id: contract.counterparty_id,
    counterparty_address: contract.counterparty_address ?? "",
    counterparty_contact: contract.counterparty_contact ?? "",
    amount: contract.amount ?? "",
    transfer_purpose: contract.transfer_purpose ?? "",
    with_ownership_transfer: normalizeOwnership(
      contract.contract_type,
      contract.transfer_purpose ?? "",
      contract.with_ownership_transfer,
    ),
    storage_facility_type: contract.storage_facility_type ?? "",
    disposal_facility_type: contract.disposal_facility_type ?? "",
    wastes: [
      ...contract.wastes.map((item) => ({
        waste_id: item.waste_id,
        cost_per_unit: item.cost_per_unit ?? "",
        label: wasteLabel(item.waste),
      })),
      { ...emptyContractWasteRow },
    ],
  };
}
