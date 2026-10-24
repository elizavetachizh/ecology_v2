import { z } from "zod";
import {
  isOperationDateLocked,
  type Operation,
} from "../../../../entities/waste/operations";
import { formatDate } from "../../../../shared/lib/format-date";
import {
  operationAmountSchema,
  operationDateSchema,
} from "./operation-form.schema";

const uuidValue = z.uuid();

export function createEditOperationFormSchema(
  requireWasteSource: boolean,
  lockDate: string | null = null,
) {
  return z
    .object({
      date: operationDateSchema,
      amount: operationAmountSchema,
      waste_source_id: z.string(),
    })
    .superRefine((values, ctx) => {
      if (
        requireWasteSource &&
        !uuidValue.safeParse(values.waste_source_id).success
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["waste_source_id"],
          message: "Выберите источник образования",
        });
      }

      if (!lockDate || !isOperationDateLocked(values.date, lockDate)) return;
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: `Дата попадает в закрытый период (по ${formatDate(lockDate)})`,
      });
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
