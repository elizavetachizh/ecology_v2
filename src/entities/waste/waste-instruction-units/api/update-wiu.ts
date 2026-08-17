import { apiSendJson } from "../../../../shared/api/api-client";
import type {
  WasteInstructionUnit,
  WasteInstructionUnitScope,
  WasteInstructionUnitUpdate,
} from "../model/wiu.types";
import { wiuItemPath } from "./paths";

export function updateWasteInstructionUnit(
  scope: WasteInstructionUnitScope,
  bindingId: string,
  body: WasteInstructionUnitUpdate,
  signal?: AbortSignal,
): Promise<WasteInstructionUnit> {
  return apiSendJson<WasteInstructionUnit>(wiuItemPath(scope, bindingId), {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
