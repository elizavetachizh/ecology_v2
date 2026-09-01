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

function emptyToNull(value: string): string | null {
  return value.trim() || null;
}

export function toContractWriteBody(
  values: ContractFormValues,
): ContractCreate {
  const isRecycling = values.contract_type === "recycling";
  return {
    number: values.number.trim(),
    start_date: values.start_date,
    end_date: emptyToNull(values.end_date),
    contract_type: values.contract_type,
    status: values.status,
    counterparty_id: values.counterparty_id,
    amount: emptyToNull(values.amount),
    with_ownership_transfer: isRecycling
      ? values.with_ownership_transfer
      : false,
    transfer_purpose: isRecycling ? values.transfer_purpose || null : null,
    wastes: values.wastes
      .filter((item) => item.waste_id)
      .map((item) => ({
        waste_id: item.waste_id,
        cost_per_unit: emptyToNull(item.cost_per_unit),
      })),
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
    amount: contract.amount ?? "",
    with_ownership_transfer: contract.with_ownership_transfer,
    transfer_purpose: contract.transfer_purpose ?? "",
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
