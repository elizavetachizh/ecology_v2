import type {
  Ttn,
  TtnCreate,
  TtnUpdate,
} from "../../../../entities/waste/ttns";
import type { TtnFormValues } from "./ttn-form.schema";

export function toTtnWriteBody(values: TtnFormValues): TtnCreate {
  return {
    number: values.number.trim(),
    date: values.date,
    unit_id: values.unit_id,
    recycling_contract_id: values.recycling_contract_id,
    status: values.status,
  };
}

export function toTtnUpdateBody(values: TtnFormValues): TtnUpdate {
  return toTtnWriteBody(values);
}

export function toTtnFormValues(ttn: Ttn): TtnFormValues {
  return {
    number: ttn.number,
    date: ttn.date,
    unit_id: ttn.unit_id,
    recycling_contract_id: ttn.recycling_contract_id,
    status: ttn.status,
  };
}
