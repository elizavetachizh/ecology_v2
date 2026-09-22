import { z } from "zod";
import {
  isoDateZodSchema,
  todayIsoDate,
} from "../../../../shared/lib/format-date";

const isoDate = isoDateZodSchema();

export const ttnFormSchema = z.object({
  number: z
    .string()
    .trim()
    .min(1, "Укажите номер ТТН")
    .max(255, "Не более 255 символов"),
  date: isoDate.min(1, "Укажите дату перевозки"),
  unit_id: z.uuid("Выберите структурную единицу"),
  recycling_contract_id: z.uuid("Выберите действующий договор утилизации"),
});

export type TtnFormValues = z.infer<typeof ttnFormSchema>;

export const ttnFormDefaultValues: TtnFormValues = {
  number: "",
  date: todayIsoDate(),
  unit_id: "",
  recycling_contract_id: "",
};
