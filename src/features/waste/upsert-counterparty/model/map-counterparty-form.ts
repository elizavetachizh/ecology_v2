import type { CounterpartyCreate } from "../../../../entities/waste/counterparties";
import type { CounterpartyFormValues } from "./counterparty-form.schema";

export function toCounterpartyWriteBody(
  values: CounterpartyFormValues,
): CounterpartyCreate {
  return {
    name: values.name.trim(),
    full_name: values.full_name.trim() || null,
    unp: values.unp.trim() || null,
    address: values.address.trim() || null,
    is_individual: values.is_individual,
    is_active: values.is_active,
  };
}
