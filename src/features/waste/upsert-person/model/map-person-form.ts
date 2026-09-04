import type { PersonCreate } from "../../../../entities/waste/persons";
import type { PersonFormValues } from "./person-form.schema";

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toPersonWriteBody(values: PersonFormValues): PersonCreate {
  return {
    name: values.name,
    first_name: emptyToNull(values.first_name),
    last_name: emptyToNull(values.last_name),
    middle_name: emptyToNull(values.middle_name),
    beltopgas_uuid: emptyToNull(values.beltopgas_uuid),
  };
}
