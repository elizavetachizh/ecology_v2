import type {
  OperationType,
  OperationUpdate,
} from "../../../../entities/waste/operations";
import type { EditOperationFormValues } from "./edit-operation-form.schema";

export function toOperationUpdateBody(
  values: EditOperationFormValues,
  operationType: OperationType,
): OperationUpdate {
  return {
    date: values.date,
    amount: values.amount,
    ...(operationType === "formed"
      ? { waste_source_id: values.waste_source_id }
      : {}),
  };
}
