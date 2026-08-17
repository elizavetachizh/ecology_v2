import { apiSendJson } from "../../../../shared/api/api-client";
import type {
  Instruction,
  InstructionUpdate,
} from "../model/instructions.types";

export function updateInstruction(
  id: string,
  body: InstructionUpdate,
  signal?: AbortSignal,
) {
  return apiSendJson<Instruction>(`/api/v1/mdm/instructions/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
