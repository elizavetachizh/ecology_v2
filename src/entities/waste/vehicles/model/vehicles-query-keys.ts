import type { GetVehiclesParams } from "./vehicles.types";

export const vehiclesQueryKeys = {
  all: ["mdm", "vehicles"] as const,
  lists: () => [...vehiclesQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetVehiclesParams) =>
    [...vehiclesQueryKeys.lists(), tenantId, params] as const,
  details: () => [...vehiclesQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...vehiclesQueryKeys.details(), tenantId, id] as const,
};
