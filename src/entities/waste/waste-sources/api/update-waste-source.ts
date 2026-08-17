import { apiSendJson } from "../../../../shared/api/api-client";
import type { WasteSource, WasteSourceUpdate } from "../model/waste-sources.types";

export function updateWasteSource(
  id: string,
  body: WasteSourceUpdate,
  signal?: AbortSignal,
): Promise<WasteSource> {
  return apiSendJson<WasteSource>(`/api/v1/mdm/waste-sources/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
