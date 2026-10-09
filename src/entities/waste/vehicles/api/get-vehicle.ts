import { apiJson } from "../../../../shared/api/api-client";
import type { Vehicle } from "../model/vehicles.types";

export function getVehicle(id: string, signal?: AbortSignal): Promise<Vehicle> {
  return apiJson<Vehicle>(`/api/v1/mdm/vehicles/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
