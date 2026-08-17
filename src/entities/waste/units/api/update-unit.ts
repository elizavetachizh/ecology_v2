import { apiSendJson } from "../../../../shared/api/api-client";
import type { Unit, UnitUpdate } from "../model/units.types";

export function updateUnit(id: string, body: UnitUpdate, signal?: AbortSignal) {
  return apiSendJson<Unit>(`/api/v1/mdm/units/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
