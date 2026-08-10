import type { GetInstructionsParams } from "./instructions.types";

/**
 * Tenant-scoped keys: list/detail включают tenantId (план §2.1 / §4.1).
 * Инвалидация списков: `lists()`; деталей: `details()` или `detail(tenantId, id)`.
 */
export const instructionsQueryKeys = {
  all: ["mdm", "instructions"] as const,
  lists: () => [...instructionsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetInstructionsParams) =>
    [...instructionsQueryKeys.lists(), tenantId, params] as const,
  details: () => [...instructionsQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...instructionsQueryKeys.details(), tenantId, id] as const,
};
