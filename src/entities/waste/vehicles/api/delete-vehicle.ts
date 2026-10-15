import { apiDelete } from "../../../../shared/api/api-client";

export function deleteVehicle(id: string): Promise<void> {
  return apiDelete(`/api/v1/mdm/vehicles/${id}`, { tenantScoped: true });
}
