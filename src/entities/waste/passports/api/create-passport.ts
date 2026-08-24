import { apiSendJson } from "../../../../shared/api/api-client";
import type { Passport, PassportCreate } from "../model/passports.types";

export function createPassport(
  body: PassportCreate,
  signal?: AbortSignal,
): Promise<Passport> {
  return apiSendJson<Passport>("/api/v1/operations/passports", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
