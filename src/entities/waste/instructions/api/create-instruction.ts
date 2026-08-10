import { apiJson } from "../../../../shared/api/api-client";
import type {
  Instruction,
  InstructionCreate,
} from "../model/instructions.types";

export function createInstruction(
  body: InstructionCreate,
  signal?: AbortSignal,
) {
  return apiJson<Instruction>("/api/v1/mdm/instructions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    tenantScoped: true,
    signal,
  });
}
