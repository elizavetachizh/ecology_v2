import { apiJson } from "../../../../shared/api/api-client";
import type {
  WasteInstructionUnit,
  WasteInstructionUnitScope,
} from "../model/wiu.types";
import { wiuItemPath } from "./paths";

export function getWasteInstructionUnit(
  scope: WasteInstructionUnitScope,
  bindingId: string,
  signal?: AbortSignal,
): Promise<WasteInstructionUnit> {
  return apiJson<WasteInstructionUnit>(`${wiuItemPath(scope, bindingId)}`, {
    signal,
    tenantScoped: true,
  });
}
