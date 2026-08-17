import { apiSendJson } from "../../../../shared/api/api-client";
import type { WasteSource, WasteSourceCreate } from "../model/waste-sources.types";

export function createWasteSource(
  body: WasteSourceCreate,
  signal?: AbortSignal,
): Promise<WasteSource> {
  return apiSendJson<WasteSource>("/api/v1/mdm/waste-sources", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
