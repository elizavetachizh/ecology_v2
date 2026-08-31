import { apiSendJson } from "../../../../shared/api/api-client";
import type { Standard, StandardUpdate } from "../model/standards.types";

export function updateStandard(
  id: string,
  body: StandardUpdate,
  signal?: AbortSignal,
): Promise<Standard> {
  return apiSendJson<Standard>(`/api/v1/mdm/standards/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
