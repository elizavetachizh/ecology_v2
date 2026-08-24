import type {
  Contract,
  ContractCreate,
  ContractUpdate,
} from "../../../../entities/waste/contracts";
import type { ContractFormValues } from "./contract-form.schema";

function emptyToNull(value: string): string | null {
  return value.trim() || null;
}

export function toContractWriteBody(
  values: ContractFormValues,
): ContractCreate {
  return {
    number: values.number.trim(),
    start_date: values.start_date,
    end_date: emptyToNull(values.end_date),
    contract_type: values.contract_type,
    status: values.status,
    counterparty_id: values.counterparty_id,
    amount: emptyToNull(values.amount),
    wastes: values.wastes.map((item) => ({
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
    wastes: contract.wastes.map((item) => ({
      waste_id: item.waste_id,
      cost_per_unit: item.cost_per_unit ?? "",
      label: `${item.waste.waste_classifier.code} — ${item.waste.waste_classifier.name}`,
    })),
  };
}
