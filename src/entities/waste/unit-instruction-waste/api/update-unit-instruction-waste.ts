import { apiSendJson } from "../../../../shared/api/api-client";
import type {
  UnitInstructionWaste,
  UnitInstructionWasteScope,
  UnitInstructionWasteUpdate,
} from "../model/uiw.types";
import { uiwItemPath } from "./paths";

export function updateUnitInstructionWaste(
  scope: UnitInstructionWasteScope,
  bindingId: string,
  body: UnitInstructionWasteUpdate,
  signal?: AbortSignal,
): Promise<UnitInstructionWaste> {
  return apiSendJson<UnitInstructionWaste>(uiwItemPath(scope, bindingId), {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
