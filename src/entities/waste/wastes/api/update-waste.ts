import { apiJson } from "../../../../shared/api/api-client";
import type { Waste, WasteUpdate } from "../model/wastes.types";

export function updateWaste(
  id: string,
  body: WasteUpdate,
  signal?: AbortSignal,
): Promise<Waste> {
  return apiJson<Waste>(`/api/v1/mdm/wastes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    tenantScoped: true,
    signal,
  });
}
