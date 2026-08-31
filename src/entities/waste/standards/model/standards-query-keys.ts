import type { GetStandardsParams } from "./standards.types";

export const standardsQueryKeys = {
  all: ["mdm", "standards"] as const,
  lists: () => [...standardsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetStandardsParams) =>
    [...standardsQueryKeys.lists(), tenantId, params] as const,
  details: () => [...standardsQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...standardsQueryKeys.details(), tenantId, id] as const,
};
