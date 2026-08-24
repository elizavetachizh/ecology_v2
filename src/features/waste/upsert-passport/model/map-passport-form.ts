import type {
  Passport,
  PassportCreate,
  PassportUpdate,
} from "../../../../entities/waste/passports";
import type { PassportFormValues } from "./passport-form.schema";

function emptyToNull(value: string): string | null {
  return value.trim() || null;
}

export function toPassportWriteBody(values: PassportFormValues): PassportCreate {
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
    status: values.status,
    waste_producer_id: emptyToNull(values.waste_producer_id),
    wastes: values.waste_ids.map((waste_id) => ({ waste_id })),
  };
}

/** PATCH всегда шлёт wastes — полная замена; пустой список запрещён схемой. */
export function toPassportUpdateBody(
  values: PassportFormValues,
): PassportUpdate {
  return toPassportWriteBody(values);
}

export function toPassportFormValues(passport: Passport): PassportFormValues {
  return {
    number: passport.number,
    date: passport.date,
    unit_id: passport.unit_id,
    status: passport.status,
    recycling_contract_id: passport.recycling_contract_id,
    waste_ids: passport.wastes.map((item) => item.waste_id),
    transport_type: passport.transport_type,
    transport_contract_id: passport.transport_contract_id ?? "",
    waste_producer_id: passport.waste_producer_id ?? "",
  };
}
