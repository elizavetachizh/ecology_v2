import { apiJson } from "../../../../shared/api/api-client";
import type {
  GetUnitInstructionWastesParams,
  UnitInstructionWasteListResponse,
  UnitInstructionWasteScope,
} from "../model/uiw.types";
import { uiwCollectionPath } from "./paths";

export function getUnitInstructionWastes(
  scope: UnitInstructionWasteScope,
  params: GetUnitInstructionWastesParams,
  signal?: AbortSignal,
): Promise<UnitInstructionWasteListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  return apiJson<UnitInstructionWasteListResponse>(
    `${uiwCollectionPath(scope)}?${searchParams}`,
    { signal, tenantScoped: true },
  );
}
