import { z } from "zod";
import { todayIsoDate } from "../../../../shared/lib/format-date";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");

export const orderFormSchema = z.object({
  number: z
    .string()
    .trim()
    .min(1, "Укажите номер приказа")
    .max(255, "Не более 255 символов"),
  start_date: isoDate,
  unit_id: z
    .union([
      z.uuid({ message: "Выберите корректное подразделение" }),
      z.literal(""),
      z.null(),
    ])
    .optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export const orderFormDefaultValues: OrderFormValues = {
  number: "",
  start_date: todayIsoDate(),
  unit_id: "",
};
