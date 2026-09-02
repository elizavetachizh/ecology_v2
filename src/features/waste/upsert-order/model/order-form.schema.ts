import { z } from "zod";

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
  unit_id: z.string().uuid("Выберите подразделение"),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export function todayIsoDate(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const orderFormDefaultValues: OrderFormValues = {
  number: "",
  start_date: todayIsoDate(),
  unit_id: "",
};
