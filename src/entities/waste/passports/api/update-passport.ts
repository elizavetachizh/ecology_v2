import { apiSendJson } from "../../../../shared/api/api-client";
import type { Passport, PassportUpdate } from "../model/passports.types";

export function updatePassport(
  id: string,
  body: PassportUpdate,
  signal?: AbortSignal,
): Promise<Passport> {
  return apiSendJson<Passport>(`/api/v1/operations/passports/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
