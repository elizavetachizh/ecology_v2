import { apiJson } from "../../../../shared/api/api-client";
import type { WasteSource, WasteSourceCreate } from "../model/waste-sources.types";

export function createWasteSource(
  body: WasteSourceCreate,
  signal?: AbortSignal,
): Promise<WasteSource> {
  return apiJson<WasteSource>(`/api/v1/mdm/waste-sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    tenantScoped: true,
    signal,
  });
}
