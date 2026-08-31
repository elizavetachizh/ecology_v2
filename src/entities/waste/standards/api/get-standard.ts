import { apiJson } from "../../../../shared/api/api-client";
import type { Standard } from "../model/standards.types";

export function getStandard(
  id: string,
  signal?: AbortSignal,
): Promise<Standard> {
  return apiJson<Standard>(`/api/v1/mdm/standards/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
