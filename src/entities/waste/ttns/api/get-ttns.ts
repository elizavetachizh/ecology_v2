import { apiJson } from "../../../../shared/api/api-client";
import type { GetTtnsParams, TtnListResponse } from "../model/ttns.types";

export function getTtns(
  params: GetTtnsParams,
  signal?: AbortSignal,
): Promise<TtnListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.unit_id) searchParams.set("unit_id", params.unit_id);
  if (params.recycling_contract_id)
    searchParams.set("recycling_contract_id", params.recycling_contract_id);
  if (params.date_from) searchParams.set("date_from", params.date_from);
  if (params.date_to) searchParams.set("date_to", params.date_to);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  return apiJson<TtnListResponse>(`/api/v1/operations/ttns?${searchParams}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
