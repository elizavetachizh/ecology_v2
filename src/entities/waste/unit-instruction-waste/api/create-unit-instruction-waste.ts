import { apiSendJson } from "../../../../shared/api/api-client";
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
  return apiSendJson<UnitInstructionWaste>(uiwCollectionPath(scope), {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
