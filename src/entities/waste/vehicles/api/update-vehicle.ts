import { apiSendJson } from "../../../../shared/api/api-client";
import type { Vehicle, VehicleUpdate } from "../model/vehicles.types";

export function updateVehicle(
  id: string,
  body: VehicleUpdate,
  signal?: AbortSignal,
): Promise<Vehicle> {
  return apiSendJson<Vehicle>(`/api/v1/mdm/vehicles/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
