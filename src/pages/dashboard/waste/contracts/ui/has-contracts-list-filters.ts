import type { ContractsFiltersValue } from "./contracts-filters";

export function hasContractsListFilters(
  values: ContractsFiltersValue,
): boolean {
  return Boolean(
    values.q ||
    values.status ||
    values.contract_type ||
    values.counterparty_id ||
    values.waste_id,
  );
}
