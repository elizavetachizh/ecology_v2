import { apiJson } from "../../../../shared/api/api-client";
import type { Unit, UnitUpdate } from "../model/units.types";

export function updateUnit(id: string, body: UnitUpdate, signal?: AbortSignal) {
  return apiJson<Unit>(`/api/v1/mdm/units/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    tenantScoped: true,
    signal,
  });
}
