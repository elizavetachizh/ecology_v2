import { apiJson } from "../../../../shared/api/api-client";
import type {
  GetPermitsParams,
  PermitListResponse,
} from "../model/permits.types";

export function getPermits(
  params: GetPermitsParams,
  signal?: AbortSignal,
): Promise<PermitListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.unit_id) searchParams.set("unit_id", params.unit_id);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  return apiJson<PermitListResponse>(`/api/v1/mdm/permits?${searchParams}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
