import type {
  Instruction,
  InstructionCreate,
} from "../../../../entities/waste/instructions";
import type { InstructionFormValues } from "./instruction-form.schema";

export function toInstructionFormValues(
  instruction: Instruction,
): InstructionFormValues {
  return {
    name: instruction.name,
    short_name: instruction.short_name ?? "",
    start_date: instruction.start_date ?? "",
    end_date: instruction.end_date ?? "",
    status: instruction.status,
  };
} 

export function toInstructionWriteBody(
  values: InstructionFormValues,
): InstructionCreate {
  return {
    name: values.name.trim(),
    short_name: values.short_name.trim() || null,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
    status: values.status,
  };
}
