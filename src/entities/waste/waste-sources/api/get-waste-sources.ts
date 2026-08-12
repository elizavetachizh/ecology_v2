import { apiJson } from "../../../../shared/api/api-client";
import type {
  GetWasteSourcesParams,
  WasteSourceListResponse,
} from "../model/waste-sources.types";

export function getWasteSources(
  params: GetWasteSourcesParams,
  signal?: AbortSignal,
): Promise<WasteSourceListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.search) searchParams.set("search", params.search);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  return apiJson<WasteSourceListResponse>(
    `/api/v1/mdm/waste-sources?${searchParams}`,
    { signal, tenantScoped: true },
  );
}
