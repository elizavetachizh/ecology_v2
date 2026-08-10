import { apiJson } from "../../../../shared/api/api-client";
import type { Unit } from "../model/units.types";

export function getUnit(id: string, signal?: AbortSignal): Promise<Unit> {
  return apiJson<Unit>(`/api/v1/mdm/units/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
