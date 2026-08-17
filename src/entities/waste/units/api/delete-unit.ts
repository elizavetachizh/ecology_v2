import { apiDelete } from "../../../../shared/api/api-client";

export function deleteUnit(id: string): Promise<void> {
  return apiDelete(`/api/v1/mdm/units/${id}`, { tenantScoped: true });
}
