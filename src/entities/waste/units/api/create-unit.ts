import { apiSendJson } from "../../../../shared/api/api-client";
import type { UnitCreate, Unit } from "../model/units.types";

export function createUnit(body: UnitCreate, signal?: AbortSignal) {
  return apiSendJson<Unit>("/api/v1/mdm/units", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
