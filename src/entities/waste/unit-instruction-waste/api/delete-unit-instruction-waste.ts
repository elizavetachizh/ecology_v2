import { apiFetch } from "../../../../shared/api/api-client";
import type { UnitInstructionWasteScope } from "../model/uiw.types";
import { uiwItemPath } from "./paths";

export async function deleteUnitInstructionWaste(
  scope: UnitInstructionWasteScope,
  bindingId: string,
): Promise<void> {
  await apiFetch(uiwItemPath(scope, bindingId), {
    method: "DELETE",
    tenantScoped: true,
  });
}
