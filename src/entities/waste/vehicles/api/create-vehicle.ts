import { apiSendJson } from "../../../../shared/api/api-client";
import type { Vehicle, VehicleCreate } from "../model/vehicles.types";

export function createVehicle(
  body: VehicleCreate,
  signal?: AbortSignal,
): Promise<Vehicle> {
  return apiSendJson<Vehicle>("/api/v1/mdm/vehicles", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
