import { apiJson } from "../../../../shared/api/api-client";
import type { UnitDetail } from "../model/units.types";

export function getUnit(id: string, signal?: AbortSignal): Promise<UnitDetail> {
  return apiJson<UnitDetail>(`/api/v1/mdm/units/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
