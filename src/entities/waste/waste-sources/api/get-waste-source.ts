import { apiJson } from "../../../../shared/api/api-client";
import type { WasteSource } from "../model/waste-sources.types";

export function getWasteSource(
  id: string,
  signal?: AbortSignal,
): Promise<WasteSource> {
  return apiJson<WasteSource>(`/api/v1/mdm/waste-sources/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
