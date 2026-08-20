import type { InstructionFormValues } from "./instruction-form.schema";
import type {
  InstructionCreate,
  InstructionUpdate,
} from "../../../../entities/waste/instructions";

function identityFields(values: InstructionFormValues) {
  return {
    name: values.name.trim(),
    short_name: values.short_name.trim() || undefined,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
  };
}

/** Create/update без смены статуса (черновик на create). */
export function toInstructionWriteBody(
  values: InstructionFormValues,
): InstructionCreate {
  return identityFields(values);
}

export function toInstructionActivateBody(
  values: InstructionFormValues,
): InstructionCreate {
  return {
    ...identityFields(values),
    status: "active",
  };
}

export function toInstructionDeactivateBody(): InstructionUpdate {
  return { status: "inactive" };
}
