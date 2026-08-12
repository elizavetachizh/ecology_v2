import { apiJson } from "../../../../shared/api/api-client";
import type {
  UnitInstructionWaste,
  UnitInstructionWasteCreate,
  UnitInstructionWasteScope,
} from "../model/uiw.types";
import { uiwCollectionPath } from "./paths";

export function createUnitInstructionWaste(
  scope: UnitInstructionWasteScope,
  body: UnitInstructionWasteCreate,
  signal?: AbortSignal,
): Promise<UnitInstructionWaste> {
  return apiJson<UnitInstructionWaste>(uiwCollectionPath(scope), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    tenantScoped: true,
    signal,
  });
}
