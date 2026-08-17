import { apiDelete } from "../../../../shared/api/api-client";

export function deleteWasteSource(id: string): Promise<void> {
  return apiDelete(`/api/v1/mdm/waste-sources/${id}`, { tenantScoped: true });
}
