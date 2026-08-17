import { apiSendJson } from "../../../../shared/api/api-client";
import type {
  WasteInstructionUnit,
  WasteInstructionUnitCreate,
  WasteInstructionUnitScope,
} from "../model/wiu.types";
import { wiuCollectionPath } from "./paths";

export function createWasteInstructionUnit(
  scope: WasteInstructionUnitScope,
  body: WasteInstructionUnitCreate,
  signal?: AbortSignal,
): Promise<WasteInstructionUnit> {
  return apiSendJson<WasteInstructionUnit>(wiuCollectionPath(scope), {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
