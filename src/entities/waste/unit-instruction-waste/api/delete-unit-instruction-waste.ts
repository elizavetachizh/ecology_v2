import { apiDelete } from "../../../../shared/api/api-client";
import type { UnitInstructionWasteScope } from "../model/uiw.types";
import { uiwItemPath } from "./paths";

export function deleteUnitInstructionWaste(
  scope: UnitInstructionWasteScope,
  bindingId: string,
): Promise<void> {
  return apiDelete(uiwItemPath(scope, bindingId), { tenantScoped: true });
}
