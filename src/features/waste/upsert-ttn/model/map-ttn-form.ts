import type {
  Ttn,
  TtnCreate,
  TtnUpdate,
} from "../../../../entities/waste/ttns";
import type { TtnFormValues } from "./ttn-form.schema";

function toTtnFields(values: TtnFormValues): Omit<TtnCreate, "status"> {
  return {
    number: values.number.trim(),
    date: values.date,
    unit_id: values.unit_id,
    recycling_contract_id: values.recycling_contract_id,
  };
}

export function toTtnWriteBody(values: TtnFormValues): TtnCreate {
  return { ...toTtnFields(values), status: "active" };
}

/** PATCH не трогает status: его нельзя сменить из формы. */
export function toTtnUpdateBody(values: TtnFormValues): TtnUpdate {
  return toTtnFields(values);
}

export function toTtnFormValues(ttn: Ttn): TtnFormValues {
  return {
    number: ttn.number,
    date: ttn.date,
    unit_id: ttn.unit_id,
    recycling_contract_id: ttn.recycling_contract_id,
  };
}
