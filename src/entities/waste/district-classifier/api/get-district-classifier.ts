import { apiJson } from "../../../../shared/api/api-client";
import type { DistrictClassifierListResponse } from "../model/district-classifier.types";

export interface GetDistrictClassifiersParams {
  search?: string;
  region_id: number;
  limit: number;
  offset: number;
}

export function getDistrictClassifiers(
  params: GetDistrictClassifiersParams,
  signal?: AbortSignal,
): Promise<DistrictClassifierListResponse> {
  // 2. Убираем пустую строку поиска, чтобы не спамить в URL пустой переменной "?search="
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });

  if (params.search) searchParams.set("search", params.search);
  if (params.region_id) searchParams.set("region_id", String(params.region_id));

  return apiJson<DistrictClassifierListResponse>(
    `/api/v1/classifiers/districts?${searchParams}`,
    {
      signal,
    },
  );
}
