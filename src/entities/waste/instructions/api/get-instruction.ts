import { apiJson } from "../../../../shared/api/api-client";
import type { Instruction } from "../model/instructions.types";

export function getInstruction(
  id: string,
  signal?: AbortSignal,
): Promise<Instruction> {
  return apiJson<Instruction>(`/api/v1/mdm/instructions/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
