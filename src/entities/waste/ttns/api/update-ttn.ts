import { apiSendJson } from "../../../../shared/api/api-client";
import type { Ttn, TtnUpdate } from "../model/ttns.types";

export function updateTtn(
  id: string,
  body: TtnUpdate,
  signal?: AbortSignal,
): Promise<Ttn> {
  return apiSendJson<Ttn>(`/api/v1/operations/ttns/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
