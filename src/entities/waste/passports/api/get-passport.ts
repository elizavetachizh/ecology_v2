import { apiJson } from "../../../../shared/api/api-client";
import type { Passport } from "../model/passports.types";

export function getPassport(
  id: string,
  signal?: AbortSignal,
): Promise<Passport> {
  return apiJson<Passport>(`/api/v1/operations/passports/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
