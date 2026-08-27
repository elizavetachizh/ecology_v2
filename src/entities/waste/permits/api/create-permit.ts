import { apiSendJson } from "../../../../shared/api/api-client";
import type { Permit, PermitCreate } from "../model/permits.types";

export function createPermit(
  body: PermitCreate,
  signal?: AbortSignal,
): Promise<Permit> {
  return apiSendJson<Permit>("/api/v1/mdm/permits", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
