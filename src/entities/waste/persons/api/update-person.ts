import { apiSendJson } from "../../../../shared/api/api-client";
import type { Person, PersonUpdate } from "../model/persons.types";

export function updatePerson(
  id: string,
  body: PersonUpdate,
  signal?: AbortSignal,
): Promise<Person> {
  return apiSendJson<Person>(`/api/v1/mdm/persons/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
