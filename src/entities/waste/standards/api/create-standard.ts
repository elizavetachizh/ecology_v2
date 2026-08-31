import { apiSendJson } from "../../../../shared/api/api-client";
import type { Standard, StandardCreate } from "../model/standards.types";

export function createStandard(
  body: StandardCreate,
  signal?: AbortSignal,
): Promise<Standard> {
  return apiSendJson<Standard>("/api/v1/mdm/standards", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
