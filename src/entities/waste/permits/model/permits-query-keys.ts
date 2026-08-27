import type { GetPermitsParams } from "./permits.types";

export const permitsQueryKeys = {
  all: ["mdm", "permits"] as const,
  lists: () => [...permitsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetPermitsParams) =>
    [...permitsQueryKeys.lists(), tenantId, params] as const,
  details: () => [...permitsQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...permitsQueryKeys.details(), tenantId, id] as const,
};
