import { apiSendJson } from "../../../../shared/api/api-client";
import type { Waste, WasteCreate } from "../model/wastes.types";

export function createWaste(
  body: WasteCreate,
  signal?: AbortSignal,
): Promise<Waste> {
  return apiSendJson<Waste>("/api/v1/mdm/wastes", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
