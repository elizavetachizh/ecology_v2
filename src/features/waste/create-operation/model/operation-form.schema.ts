import { z } from "zod";
import { OperationTypeValues } from "../../../../entities/waste/operations";

const amountSchema = z
  .string()
  .trim()
  .min(1, "Укажите количество")
  .regex(
    /^\d+(\.\d{1,6})?$/,
    "Число больше 0, не более 6 знаков после запятой",
  )
  .refine((value) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 && n <= 999_999.999_999;
  }, "Количество должно быть больше 0");

export const operationFormSchema = z
  .object({
    date: z
      .string()
      .min(1, "Укажите дату операции")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД"),
    operation_type: z.enum(OperationTypeValues, {
      error: "Выберите тип операции",
    }),
    unit_id: z.string().uuid("Выберите место учёта"),
    waste_id: z.string().uuid("Выберите отход"),
    waste_source_id: z.string(),
    amount: amountSchema,
  })
  .superRefine((values, ctx) => {
    if (values.operation_type === "formed") {
      const parsed = z.string().uuid().safeParse(values.waste_source_id);
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          path: ["waste_source_id"],
          message: "Выберите источник образования",
        });
      }
    }

    if (values.operation_type === "used" && values.waste_source_id) {
      ctx.addIssue({
        code: "custom",
        path: ["waste_source_id"],
        message: "Для операции «Использовано» источник не указывается",
      });
    }
  });

export type OperationFormValues = z.infer<typeof operationFormSchema>;

export function todayIsoDate(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function createEmptyOperationFormValues(): OperationFormValues {
  return {
    date: todayIsoDate(),
    operation_type: "" as OperationFormValues["operation_type"],
    unit_id: "",
    waste_id: "",
    waste_source_id: "",
    amount: "",
  };
}
