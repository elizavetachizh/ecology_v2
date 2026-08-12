import { apiJson } from "../../../../shared/api/api-client";
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
  return apiJson<UnitInstructionWaste>(uiwItemPath(scope, bindingId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    tenantScoped: true,
    signal,
  });
}
