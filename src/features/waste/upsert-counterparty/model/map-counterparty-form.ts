import type {
  Counterparty,
  CounterpartyCreate,
} from "../../../../entities/waste/counterparties";
import type { CounterpartyFormValues } from "./counterparty-form.schema";

export function toCounterpartyWriteBody(
  values: CounterpartyFormValues,
): CounterpartyCreate {
  return {
    name: values.name.trim(),
    full_name: values.full_name.trim() || null,
    unp: values.unp.trim() || null,
    address: values.address.trim() || null,
    contact: values.contact.trim() || null,
    is_individual: values.is_individual,
    is_active: values.is_active,
  };
}

export function toCounterpartyFormValues(
  counterparty: Counterparty,
): CounterpartyFormValues {
  return {
    name: counterparty.name,
    full_name: counterparty.full_name ?? "",
    unp: counterparty.unp ?? "",
    address: counterparty.address ?? "",
    contact: counterparty.contact ?? "",
    is_individual: counterparty.is_individual,
    is_active: counterparty.is_active,
  };
}
