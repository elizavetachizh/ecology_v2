import { apiJson } from "../../../../shared/api/api-client";
import type { WasteClassifierListResponse } from "../model/waste-classifier.types";
export interface GetWasteClassifiersParams {
  search?: string; // делаем опциональным на случай отсутствия поиска
  limit: number;
  offset: number;
}

export function getWasteClassifiers(
  params: GetWasteClassifiersParams,
  signal?: AbortSignal,
): Promise<WasteClassifierListResponse> {
  // 2. Убираем пустую строку поиска, чтобы не спамить в URL пустой переменной "?search="
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.search) searchParams.set("search", params.search);

  return apiJson<WasteClassifierListResponse>(
    `/api/v1/classifiers/wastes?${searchParams}`,
    {
      signal,
    },
  );
}
