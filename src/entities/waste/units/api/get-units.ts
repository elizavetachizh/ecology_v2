import { apiJson } from "../../../../shared/api/api-client";
import type {
  GetUnitsParams,
  GetUnitsTreeParams,
  UnitListResponse,
  UnitTree,
} from "../model/units.types";

function appendCommonParams(
  searchParams: URLSearchParams,
  params: {
    search?: string;
    region_id?: number;
    district_id?: number;
    is_pod9?: boolean;
    sort?: string;
    order?: string;
  },
) {
  if (params.search) searchParams.set("search", params.search);
  if (params.region_id != null) {
    searchParams.set("region_id", String(params.region_id));
  }
  if (params.district_id != null) {
    searchParams.set("district_id", String(params.district_id));
  }
  if (params.is_pod9 != null) {
    searchParams.set("is_pod9", String(params.is_pod9));
  }
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
}

/** Flat Page list. */
export function getUnits(
  params: GetUnitsParams,
  signal?: AbortSignal,
): Promise<UnitListResponse> {
  const searchParams = new URLSearchParams({
    hierarchical: "false",
    limit: String(params.limit),
    offset: String(params.offset),
  });
  appendCommonParams(searchParams, params);
  return apiJson<UnitListResponse>(`/api/v1/mdm/units?${searchParams}`, {
    signal,
    tenantScoped: true,
  });
}

/** Full tree for structure UI. */
export function getUnitsTree(
  params: GetUnitsTreeParams = {},
  signal?: AbortSignal,
): Promise<UnitTree[]> {
  const searchParams = new URLSearchParams({
    hierarchical: "true",
  });
  appendCommonParams(searchParams, params);
  return apiJson<UnitTree[]>(`/api/v1/mdm/units?${searchParams}`, {
    signal,
    tenantScoped: true,
  });
}
