import { apiDelete } from "../../../../shared/api/api-client";
import type { WasteInstructionUnitScope } from "../model/wiu.types";
import { wiuItemPath } from "./paths";

export function deleteWasteInstructionUnit(
  scope: WasteInstructionUnitScope,
  bindingId: string,
): Promise<void> {
  return apiDelete(wiuItemPath(scope, bindingId), { tenantScoped: true });
}
