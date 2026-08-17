import { apiJson } from "../../../../shared/api/api-client";
import type {
  GetWasteInstructionUnitsParams,
  WasteInstructionUnitListResponse,
  WasteInstructionUnitScope,
} from "../model/wiu.types";
import { wiuCollectionPath } from "./paths";

export function getWasteInstructionUnits(
  scope: WasteInstructionUnitScope,
  params: GetWasteInstructionUnitsParams,
  signal?: AbortSignal,
): Promise<WasteInstructionUnitListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  return apiJson<WasteInstructionUnitListResponse>(
    `${wiuCollectionPath(scope)}?${searchParams}`,
    { signal, tenantScoped: true },
  );
}
