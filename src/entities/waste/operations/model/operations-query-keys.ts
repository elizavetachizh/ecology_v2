import type { GetOperationsParams } from "./operations.types";

export const operationsQueryKeys = {
  all: ["operations"] as const,
  lists: () => [...operationsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetOperationsParams) =>
    [...operationsQueryKeys.lists(), tenantId, params] as const,
  details: () => [...operationsQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, operationId: string) =>
    [...operationsQueryKeys.details(), tenantId, operationId] as const,
};
