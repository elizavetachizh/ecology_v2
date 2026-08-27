import { apiDelete } from "../../../../shared/api/api-client";

export function deletePermit(id: string): Promise<void> {
  return apiDelete(`/api/v1/mdm/permits/${id}`, { tenantScoped: true });
}
