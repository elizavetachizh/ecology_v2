import type {
  Passport,
  PassportCreate,
  PassportUpdate,
} from "../../../../entities/waste/passports";
import type { PassportFormValues } from "./passport-form.schema";

function emptyToNull(value: string): string | null {
  return value.trim() || null;
}

function toPassportFields(
  values: PassportFormValues,
): Omit<PassportCreate, "status"> {
  const useTransportContract = values.transport_type === "transport_contract";
  return {
    number: values.number.trim(),
    date: values.date,
    unit_id: values.unit_id,
    recycling_contract_id: values.recycling_contract_id,
    transport_type: values.transport_type,
    transport_contract_id: useTransportContract
      ? values.transport_contract_id
      : null,
    waste_producer_id:
      values.waste_producer_type === "counterparty"
        ? emptyToNull(values.waste_producer_id)
        : null,
    wastes: values.waste_ids.map((waste_id) => ({ waste_id })),
  };
}

export function toPassportWriteBody(
  values: PassportFormValues,
): PassportCreate {
  return { ...toPassportFields(values), status: "active" };
}

/** PATCH не трогает status: его нельзя сменить из формы. */
export function toPassportUpdateBody(
  values: PassportFormValues,
): PassportUpdate {
  return toPassportFields(values);
}

export function toPassportFormValues(passport: Passport): PassportFormValues {
  return {
    number: passport.number,
    date: passport.date,
    unit_id: passport.unit_id,
    recycling_contract_id: passport.recycling_contract_id,
    waste_ids: passport.wastes.map((item) => item.waste_id),
    transport_type: passport.transport_type,
    transport_contract_id: passport.transport_contract_id ?? "",
    waste_producer_type: passport.waste_producer_id ? "counterparty" : "self",
    waste_producer_id: passport.waste_producer_id ?? "",
  };
}
