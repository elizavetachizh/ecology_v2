import { z } from "zod";

const transportUnitSchema = z
  .string()
  .trim()
  .min(1, "Укажите транспортную единицу")
  .regex(
    /^\d+(\.\d{1,6})?$/,
    "Число от 0 до 999999.999999, не более 6 знаков после запятой",
  )
  .refine((value) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 999_999.999_999;
  }, "Значение вне допустимого диапазона");

export const bindUiwFormSchema = z.object({
  waste_id: z.string().uuid("Выберите отход из справочника"),
  waste_source_ids: z.array(z.string().uuid()),
  transport_unit: transportUnitSchema,
});

export type BindUiwFormValues = z.infer<typeof bindUiwFormSchema>;

export const bindUiwFormDefaultValues: BindUiwFormValues = {
  waste_id: "",
  waste_source_ids: [],
  transport_unit: "0",
};
