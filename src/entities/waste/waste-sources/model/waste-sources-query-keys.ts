import type { GetWasteSourcesParams } from "./waste-sources.types";

export const wasteSourcesQueryKeys = {
  all: ["mdm", "waste-sources"] as const,
  lists: () => [...wasteSourcesQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetWasteSourcesParams) =>
    [...wasteSourcesQueryKeys.lists(), tenantId, params] as const,
  details: () => [...wasteSourcesQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...wasteSourcesQueryKeys.details(), tenantId, id] as const,
};
