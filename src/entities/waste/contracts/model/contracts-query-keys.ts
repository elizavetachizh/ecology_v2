import type { GetContractsParams } from "./contracts.types";

export const contractsQueryKeys = {
  all: ["operations", "contracts"] as const,
  lists: () => [...contractsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetContractsParams) =>
    [...contractsQueryKeys.lists(), tenantId, params] as const,
  details: () => [...contractsQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...contractsQueryKeys.details(), tenantId, id] as const,
};
