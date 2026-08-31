import { apiJson } from "../../../../shared/api/api-client";
import type {
  GetStandardsParams,
  StandardListResponse,
} from "../model/standards.types";

export function getStandards(
  params: GetStandardsParams,
  signal?: AbortSignal,
): Promise<StandardListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.status) searchParams.set("status", params.status);
  if (params.unit_id) searchParams.set("unit_id", params.unit_id);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  return apiJson<StandardListResponse>(
    `/api/v1/mdm/standards?${searchParams}`,
    {
      method: "GET",
      tenantScoped: true,
      signal,
    },
  );
}
