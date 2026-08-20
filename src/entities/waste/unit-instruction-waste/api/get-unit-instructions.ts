import { apiJson } from "../../../../shared/api/api-client";
import type {
  GetUnitInstructionsParams,
  UnitInstructionListResponse,
} from "../model/uiw.types";
import { unitInstructionsPath } from "./paths";

export function getUnitInstructions(
  unitId: string,
  params: GetUnitInstructionsParams,
  signal?: AbortSignal,
): Promise<UnitInstructionListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  return apiJson<UnitInstructionListResponse>(
    `${unitInstructionsPath(unitId)}?${searchParams}`,
    { signal, tenantScoped: true },
  );
}
