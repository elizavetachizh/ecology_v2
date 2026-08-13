import type { GetUnitsParams, GetUnitsTreeParams } from "./units.types";

export const unitsQueryKeys = {
  all: ["mdm", "units"] as const,
  lists: () => [...unitsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetUnitsParams) =>
    [...unitsQueryKeys.lists(), tenantId, params] as const,
  trees: () => [...unitsQueryKeys.all, "tree"] as const,
  tree: (tenantId: string, params: GetUnitsTreeParams) =>
    [...unitsQueryKeys.trees(), tenantId, params] as const,
  details: () => [...unitsQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...unitsQueryKeys.details(), tenantId, id] as const,
};