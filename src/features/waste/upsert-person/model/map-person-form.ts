import type { PersonCreate } from "../../../../entities/waste/persons";
import type { PersonFormValues } from "./person-form.schema";

export function toPersonWriteBody(values: PersonFormValues): PersonCreate {
  return {
    name: values.name,
    first_name: values.first_name,
    last_name: values.last_name,
    middle_name: values.middle_name,
    uuid: values.uuid,
  };
}
