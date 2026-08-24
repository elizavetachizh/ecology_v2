import { apiDelete } from "../../../../shared/api/api-client";

export function deletePerson(id: string): Promise<void> {
  return apiDelete(`/api/v1/mdm/persons/${id}`, { tenantScoped: true });
}
