import { apiSendJson } from "../../../../shared/api/api-client";
import type { Person, PersonCreate } from "../model/persons.types";

export function createPerson(
  body: PersonCreate,
  signal?: AbortSignal,
): Promise<Person> {
  return apiSendJson<Person>("/api/v1/mdm/persons", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
