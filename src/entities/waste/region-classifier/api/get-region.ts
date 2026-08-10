import { apiJson } from "../../../../shared/api/api-client";
import type { RegionClassifier } from "../model/region-classifier.types";

export function getRegion(
  id: string,
  signal?: AbortSignal,
): Promise<RegionClassifier> {
  return apiJson<RegionClassifier>(`/api/v1/classifiers/regions/${id}`, {
    method: "GET",
    signal,
  });
}
