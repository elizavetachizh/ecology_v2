import { apiJson } from "../../../../shared/api/api-client";
import type { Ttn } from "../model/ttns.types";

export function getTtn(id: string, signal?: AbortSignal): Promise<Ttn> {
  return apiJson<Ttn>(`/api/v1/operations/ttns/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
