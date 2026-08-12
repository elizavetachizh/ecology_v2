import type { GetWastesParams } from "./wastes.types";

export const wastesQueryKeys = {
  all: ["mdm", "wastes"] as const,
  lists: () => [...wastesQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetWastesParams) =>
    [...wastesQueryKeys.lists(), tenantId, params] as const,
  details: () => [...wastesQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...wastesQueryKeys.details(), tenantId, id] as const,
};
