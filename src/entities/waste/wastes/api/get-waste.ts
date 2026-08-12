import { apiJson } from "../../../../shared/api/api-client";
import type { Waste } from "../model/wastes.types";

export function getWaste(id: string, signal?: AbortSignal): Promise<Waste> {
  return apiJson<Waste>(`/api/v1/mdm/wastes/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
