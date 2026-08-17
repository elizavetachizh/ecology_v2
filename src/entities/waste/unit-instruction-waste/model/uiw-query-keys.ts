import type {
  GetUnitInstructionWastesParams,
  UnitInstructionWasteScope,
} from "./uiw.types";

export const uiwQueryKeys = {
  all: ["mdm", "uiw"] as const,
  lists: () => [...uiwQueryKeys.all, "list"] as const,
  list: (
    tenantId: string,
    scope: UnitInstructionWasteScope,
    params: GetUnitInstructionWastesParams,
  ) => [...uiwQueryKeys.lists(), tenantId, scope, params] as const,
  details: () => [...uiwQueryKeys.all, "detail"] as const,
  detail: (
    tenantId: string,
    scope: UnitInstructionWasteScope,
    bindingId: string,
  ) => [...uiwQueryKeys.details(), tenantId, scope, bindingId] as const,
};
 