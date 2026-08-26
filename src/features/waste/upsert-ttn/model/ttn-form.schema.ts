import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");

export const ttnFormSchema = z.object({
  number: z
    .string()
    .trim()
    .min(1, "Укажите номер ТТН")
    .max(255, "Не более 255 символов"),
  date: isoDate.min(1, "Укажите дату перевозки"),
  unit_id: z.string().uuid("Выберите структурную единицу"),
  recycling_contract_id: z
    .string()
    .uuid("Выберите действующий договор утилизации"),
});

export type TtnFormValues = z.infer<typeof ttnFormSchema>;

export function todayIsoDate(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const ttnFormDefaultValues: TtnFormValues = {
  number: "",
  date: todayIsoDate(),
  unit_id: "",
  recycling_contract_id: "",
};
