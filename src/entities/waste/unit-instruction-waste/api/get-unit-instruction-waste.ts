import { apiJson } from "../../../../shared/api/api-client";
import type {
  UnitInstructionWaste,
  UnitInstructionWasteScope,
} from "../model/uiw.types";
import { uiwItemPath } from "./paths";

export function getUnitInstructionWaste(
  scope: UnitInstructionWasteScope,
  bindingId: string,
  signal?: AbortSignal,
): Promise<UnitInstructionWaste> {
  return apiJson<UnitInstructionWaste>(uiwItemPath(scope, bindingId), {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
