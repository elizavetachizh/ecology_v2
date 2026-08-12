import { apiJson } from "../../../../shared/api/api-client";
import type { WasteSource, WasteSourceUpdate } from "../model/waste-sources.types";

export function updateWasteSource(
  id: string,
  body: WasteSourceUpdate,
  signal?: AbortSignal,
): Promise<WasteSource> {
  return apiJson<WasteSource>(`/api/v1/mdm/waste-sources/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    tenantScoped: true,
    signal,
  });
}
