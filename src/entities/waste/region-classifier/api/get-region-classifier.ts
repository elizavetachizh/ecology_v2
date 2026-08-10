import { apiJson } from "../../../../shared/api/api-client";
import type { RegionClassifierListResponse } from "../model/region-classifier.types";
export interface GetRegionClassifiersParams {
  search?: string;
  limit: number;
  offset: number;
}

export function getRegionClassifiers(
  params: GetRegionClassifiersParams,
  signal?: AbortSignal,
): Promise<RegionClassifierListResponse> {
  // 2. Убираем пустую строку поиска, чтобы не спамить в URL пустой переменной "?search="
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.search) searchParams.set("search", params.search);

  return apiJson<RegionClassifierListResponse>(
    `/api/v1/classifiers/regions?${searchParams}`,
    {
      signal,
    },
  );
}
