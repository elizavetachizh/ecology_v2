import { apiSendJson } from "../../../../shared/api/api-client";
import type { Permit, PermitUpdate } from "../model/permits.types";

export function updatePermit(
  id: string,
  body: PermitUpdate,
  signal?: AbortSignal,
): Promise<Permit> {
  return apiSendJson<Permit>(`/api/v1/mdm/permits/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
