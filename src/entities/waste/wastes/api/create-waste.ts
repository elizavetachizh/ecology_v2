import { apiJson } from "../../../../shared/api/api-client";
import type { Waste, WasteCreate } from "../model/wastes.types";

export function createWaste(
  body: WasteCreate,
  signal?: AbortSignal,
): Promise<Waste> {
  return apiJson<Waste>(`/api/v1/mdm/wastes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    tenantScoped: true,
    signal,
  });
}
