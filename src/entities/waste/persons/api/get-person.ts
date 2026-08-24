import { apiJson } from "../../../../shared/api/api-client";
import type { Person } from "../model/persons.types";

export function getPerson(id: string, signal?: AbortSignal): Promise<Person> {
  return apiJson<Person>(`/api/v1/mdm/persons/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
