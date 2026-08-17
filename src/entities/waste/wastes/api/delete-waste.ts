import { apiDelete } from "../../../../shared/api/api-client";

export function deleteWaste(id: string): Promise<void> {
  return apiDelete(`/api/v1/mdm/wastes/${id}`, { tenantScoped: true });
}
