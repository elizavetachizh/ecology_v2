import { apiJson } from "../../../../shared/api/api-client";
import type {
  Instruction,
  InstructionUpdate,
} from "../model/instructions.types";

export function updateInstruction(
  id: string,
  body: InstructionUpdate,
  signal?: AbortSignal,
) {
  return apiJson<Instruction>(`/api/v1/mdm/instructions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    tenantScoped: true,
    signal,
  });
}
