import type { GetTtnsParams } from "./ttns.types";

export const ttnsQueryKeys = {
  all: ["operations", "ttns"] as const,
  lists: () => [...ttnsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetTtnsParams) =>
    [...ttnsQueryKeys.lists(), tenantId, params] as const,
  details: () => [...ttnsQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...ttnsQueryKeys.details(), tenantId, id] as const,
};
