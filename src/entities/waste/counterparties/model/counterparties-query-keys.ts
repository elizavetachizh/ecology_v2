import type { GetCounterpartiesParams } from "./counterparties.types";

export const counterpartiesQueryKeys = {
  all: ["mdm", "counterparties"] as const,
  lists: () => [...counterpartiesQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetCounterpartiesParams) =>
    [...counterpartiesQueryKeys.lists(), tenantId, params] as const,
  details: () => [...counterpartiesQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...counterpartiesQueryKeys.details(), tenantId, id] as const,
};
