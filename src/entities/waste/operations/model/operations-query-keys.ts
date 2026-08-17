import type {
  GetBalancesParams,
  GetOperationsParams,
} from "./operations.types";

export const operationsQueryKeys = {
  all: ["operations"] as const,
  lists: () => [...operationsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetOperationsParams) =>
    [...operationsQueryKeys.lists(), tenantId, params] as const,
  details: () => [...operationsQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, operationId: string) =>
    [...operationsQueryKeys.details(), tenantId, operationId] as const,
  balances: () => [...operationsQueryKeys.all, "balances"] as const,
  balanceList: (tenantId: string, params: GetBalancesParams) =>
    [...operationsQueryKeys.balances(), tenantId, params] as const,
  current: () => [...operationsQueryKeys.all, "current"] as const,
  currentBalance: (tenantId: string, unitId: string, wasteId: string) =>
    [...operationsQueryKeys.current(), tenantId, unitId, wasteId] as const,
};
