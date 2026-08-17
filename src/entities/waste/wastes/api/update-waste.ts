import { apiSendJson } from "../../../../shared/api/api-client";
import type { Waste, WasteUpdate } from "../model/wastes.types";

export function updateWaste(
  id: string,
  body: WasteUpdate,
  signal?: AbortSignal,
): Promise<Waste> {
  return apiSendJson<Waste>(`/api/v1/mdm/wastes/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
