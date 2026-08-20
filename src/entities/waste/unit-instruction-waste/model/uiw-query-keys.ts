import type {
  GetUnitInstructionWastesParams,
  GetUnitInstructionsParams,
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
  unitInstructions: () => [...uiwQueryKeys.all, "unit-instructions"] as const,
  unitInstructionList: (
    tenantId: string,
    unitId: string,
    params: GetUnitInstructionsParams,
  ) =>
    [...uiwQueryKeys.unitInstructions(), tenantId, unitId, params] as const,
  details: () => [...uiwQueryKeys.all, "detail"] as const,
  detail: (
    tenantId: string,
    scope: UnitInstructionWasteScope,
    bindingId: string,
  ) => [...uiwQueryKeys.details(), tenantId, scope, bindingId] as const,
};
 