import type {
  GetOrdersParams,
  GetUnitResponsibleParams,
} from "./orders.types";

export const ordersQueryKeys = {
  all: ["mdm", "orders"] as const,
  lists: () => [...ordersQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetOrdersParams) =>
    [...ordersQueryKeys.lists(), tenantId, params] as const,
  details: () => [...ordersQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...ordersQueryKeys.details(), tenantId, id] as const,
  states: () => [...ordersQueryKeys.all, "states"] as const,
  stateList: (tenantId: string, orderId: string) =>
    [...ordersQueryKeys.states(), tenantId, orderId] as const,
  state: (tenantId: string, orderId: string, stateId: string) =>
    [...ordersQueryKeys.states(), tenantId, orderId, stateId] as const,
  unitResponsible: () => [...ordersQueryKeys.all, "unit-responsible"] as const,
  unitResponsibleOn: (
    tenantId: string,
    params: Pick<GetUnitResponsibleParams, "unitId" | "on">,
  ) =>
    [
      ...ordersQueryKeys.unitResponsible(),
      tenantId,
      params.unitId,
      params.on ?? null,
    ] as const,
};
