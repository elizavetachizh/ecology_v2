import { apiJson } from "../../../../shared/api/api-client";
import type { GetWastesParams, WasteListResponse } from "../model/wastes.types";

export function getWastes(
  params: GetWastesParams,
  signal?: AbortSignal,
): Promise<WasteListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.search) searchParams.set("search", params.search);
  if (params.hazard_class)
    searchParams.set("hazard_class", params.hazard_class);
  if (params.physical_state)
    searchParams.set("physical_state", params.physical_state);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  return apiJson<WasteListResponse>(`/api/v1/mdm/wastes?${searchParams}`, {
    signal,
    tenantScoped: true,
  });
}
