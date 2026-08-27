import { apiJson } from "../../../../shared/api/api-client";
import type { Permit } from "../model/permits.types";

export function getPermit(id: string, signal?: AbortSignal): Promise<Permit> {
  return apiJson<Permit>(`/api/v1/mdm/permits/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
