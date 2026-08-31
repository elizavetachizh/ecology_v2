import { apiDelete } from "../../../../shared/api/api-client";

export function deleteStandard(id: string): Promise<void> {
  return apiDelete(`/api/v1/mdm/standards/${id}`, { tenantScoped: true });
}
