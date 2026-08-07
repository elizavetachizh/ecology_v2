import type { InstructionFormValues } from "./instruction-form.schema";
import type { InstructionCreate } from "../../../../entities/waste/instructions";

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
