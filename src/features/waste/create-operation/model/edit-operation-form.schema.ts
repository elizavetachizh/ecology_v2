import { z } from "zod";
import type { Operation } from "../../../../entities/waste/operations";
import {
  operationAmountSchema,
  operationDateSchema,
} from "./operation-form.schema";

const uuidValue = z.uuid();

export function createEditOperationFormSchema(requireWasteSource: boolean) {
  return z
    .object({
      date: operationDateSchema,
      amount: operationAmountSchema,
      waste_source_id: z.string(),
    })
    .superRefine((values, ctx) => {
      if (!requireWasteSource) return;
      if (!uuidValue.safeParse(values.waste_source_id).success) {
        ctx.addIssue({
          code: "custom",
          path: ["waste_source_id"],
          message: "Выберите источник образования",
        });
      }
    });
}

export type EditOperationFormValues = z.infer<
  ReturnType<typeof createEditOperationFormSchema>
>;

export function toEditOperationFormValues(
  operation: Operation,
): EditOperationFormValues {
  return {
    date: operation.date,
    amount: operation.amount,
    waste_source_id: operation.waste_source_id ?? "",
  };
}
