import type { Person, PersonCreate } from "../../../../entities/waste/persons";
import type { PersonFormValues } from "./person-form.schema";

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toPersonFormValues(person: Person): PersonFormValues {
  return {
    name: person.name,
    first_name: person.first_name ?? "",
    last_name: person.last_name ?? "",
    middle_name: person.middle_name ?? "",
    beltopgas_uuid: person.beltopgas_uuid ?? "",
    unit_ids: [...new Set(person.unit_ids)],
  };
}

export function toPersonWriteBody(values: PersonFormValues): PersonCreate {
  return {
    name: values.name.trim(),
    first_name: emptyToNull(values.first_name),
    last_name: emptyToNull(values.last_name),
    middle_name: emptyToNull(values.middle_name),
    beltopgas_uuid: emptyToNull(values.beltopgas_uuid),
    unit_ids: values.unit_ids,
  };
}
