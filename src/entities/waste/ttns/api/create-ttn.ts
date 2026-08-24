import { apiSendJson } from "../../../../shared/api/api-client";
import type { Ttn, TtnCreate } from "../model/ttns.types";

export function createTtn(body: TtnCreate, signal?: AbortSignal): Promise<Ttn> {
  return apiSendJson<Ttn>("/api/v1/operations/ttns", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
