import type {
  GetWasteInstructionUnitsParams,
  WasteInstructionUnitScope,
} from "./wiu.types";

export const wiuQueryKeys = {
  all: ["mdm", "wiu"] as const,
  lists: () => [...wiuQueryKeys.all, "list"] as const,
  list: (
    tenantId: string,
    scope: WasteInstructionUnitScope,
    params: GetWasteInstructionUnitsParams,
  ) => [...wiuQueryKeys.lists(), tenantId, scope, params] as const,
  details: () => [...wiuQueryKeys.all, "detail"] as const,
  detail: (
    tenantId: string,
    scope: WasteInstructionUnitScope,
    bindingId: string,
  ) => [...wiuQueryKeys.details(), tenantId, scope, bindingId] as const,
};
