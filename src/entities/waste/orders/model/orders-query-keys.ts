import type { GetOrdersParams } from "./orders.types";

export const ordersQueryKeys = {
  all: ["mdm", "orders"] as const,
  lists: () => [...ordersQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetOrdersParams) =>
    [...ordersQueryKeys.lists(), tenantId, params] as const,
  details: () => [...ordersQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...ordersQueryKeys.details(), tenantId, id] as const,
};
