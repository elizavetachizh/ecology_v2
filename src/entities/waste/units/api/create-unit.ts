import { apiJson } from "../../../../shared/api/api-client";
import type { UnitCreate, Unit } from "../model/units.types";

export function createUnit(body: UnitCreate, signal?: AbortSignal) {
  return apiJson<Unit>("/api/v1/mdm/units", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    tenantScoped: true,
    signal,
  });
}
