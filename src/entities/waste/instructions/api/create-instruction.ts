import { apiSendJson } from "../../../../shared/api/api-client";
import type {
  Instruction,
  InstructionCreate,
} from "../model/instructions.types";

export function createInstruction(
  body: InstructionCreate,
  signal?: AbortSignal,
) {
  return apiSendJson<Instruction>("/api/v1/mdm/instructions", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
